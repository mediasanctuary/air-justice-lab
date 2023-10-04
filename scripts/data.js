import { getSensorHistory } from "./api.js";
import Database from 'better-sqlite3';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';

export default class Data {

	constructor(fields) {
		this.fields = fields;
		this.setupSensors();
		this.setupTimestamps();
		this.setupIndex();
	}

	setupSensors() {
		const csvData = fs.readFileSync(`./data/sensors.csv`, 'utf8');
		this.sensors = parse(csvData, {
			columns: true,
			skip_empty_lines: true
		});
	}

	setupTimestamps() {
		this.timestamps = {};
		const now = Math.floor(Date.now() / 1000);
		for (let sensor of this.sensors) {
			const files = globSync(`./data/sensor-${sensor.id}/*.csv`);
			if (files.length == 0) {
				this.timestamps[sensor.id] = {
					start: now,
					end: now
				};
				sensor.start = this.formatDate(now);
				sensor.end = this.formatDate(now);
				continue;
			}
			files.sort();
			const first = files[0];
			const last = files[files.length - 1];
			this.timestamps[sensor.id] = {
				start: parseInt(first.match(/sensor-\d+-(\d+)-\d+\.csv$/)[1]),
				end: parseInt(last.match(/sensor-\d+-\d+-(\d+)\.csv$/)[1])
			};
			sensor.start = this.formatDate(this.timestamps[sensor.id].start);
			sensor.end = this.formatDate(this.timestamps[sensor.id].end);
		}
	}

	setupIndex() {
		this.index = new Database('./data/index.db');
		this.index.pragma('journal_mode = WAL');
		this.migrateDatabase();
	}

	async loadRecords() {
		const now = Math.floor(Date.now() / 1000);
		for (let sensor of this.sensors) {
			try {
				console.log(`Loading "${sensor.name}" (${sensor.id})`);
				const timestamp = this.timestamps[sensor.id];
				this.saveRecords(sensor, await this.loadBackward(sensor, timestamp.start));
				await new Promise(resolve => setTimeout(resolve, 1000));
				if (now - timestamp.end > 24 * 60 * 60) {
					// only load forward if at least 24 hours have passed
					this.saveRecords(sensor, await this.loadForward(sensor, timestamp.end));
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} catch(error) {
				console.error(`Error: ${error.message}\n`);
				await new Promise(resolve => setTimeout(resolve, 10000));
			}
		}
		this.saveSensors();
	}

	async loadBackward(sensor, startTimestamp) {
		console.log(`    before ${startTimestamp}`);
		const rsp = await getSensorHistory(sensor.id, {
			fields: this.fields.join(','),
			end_timestamp: startTimestamp
		});
		return rsp;
	}

	async loadForward(sensor, endTimestamp) {
		console.log(`    after ${endTimestamp}`);
		const rsp = await getSensorHistory(sensor.id, {
			fields: this.fields.join(','),
			start_timestamp: endTimestamp + 1
		});
		return rsp;
	}

	saveRecords(sensor, rsp) {
		if (!rsp.data) {
			console.log(`    no data found: ${JSON.stringify(rsp)}`);
			return;
		}
		if (rsp.data.length == 0) {
			console.log('    no records found');
			return;
		}
		const header = ['id', 'time_stamp', ...this.fields];
		const dirname = `./data/sensor-${sensor.id}`;
		if (!fs.existsSync(dirname)) {
			fs.mkdirSync(dirname, 0o755);
		}
		const rows = this.getRows(rsp, header);
		const count = rows.length;
		const start = rows[0][1];
		const end = rows[count - 1][1];
		const filename = `${dirname}/sensor-${sensor.id}-${start}-${end}.csv`;
		fs.writeFileSync(filename, stringify([header, ...rows]), 'utf8');
		console.log(`    saved ${count} records ${this.timeRange(start, end)}`);
		this.updateSensor(sensor, start, end);
	}

	getRows(rsp, columns) {
		return rsp.data.map(values => {
			let row = [];
			for (let column of columns) {
				if (column == 'id') {
					row.push(rsp.sensor_index);
				} else {
					let index = rsp.fields.indexOf(column);
					let value = values[index];
					if (column.substr(0, 5) == 'pm2.5') {
						value = value.toFixed(2); // two decimal precision
					}
					row.push(value);
				}
			}
			return row;
		}).reverse();
	}

	timeRange(startTimestamp, endTimestamp) {
		const start = this.formatDate(startTimestamp);
		const end = this.formatDate(endTimestamp);
		return `${start} to ${end}`;
	}

	formatDate(timestamp) {
		const date = new Date(timestamp * 1000);
		return date.toJSON().replace('.000Z', '');
	}

	updateSensor(sensor, startTimestamp, endTimestamp) {
		const start = this.formatDate(startTimestamp);
		const end = this.formatDate(endTimestamp);
		if (!sensor.start || start < sensor.start) {
			sensor.start = start;
		}
		if (!sensor.end || end > sensor.end) {
			sensor.end = end;
		}
	}

	saveSensors() {
		const csvData = stringify(this.sensors, {
			header: true
		});
		fs.writeFileSync('./data/sensors.csv', csvData, 'utf8');
	}

	indexData() {
		const statement = this.index.prepare(`
			INSERT INTO record
			(
				sensor_id,
				time_stamp,
				pm25_alt_a,
				pm25_alt_b,
				pm25_atm_a,
				pm25_atm_b,
				pm25_cf_1_a,
				pm25_cf_1_b,
				temperature,
				humidity,
				pressure
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);
		const insertRecords = this.index.transaction(records => {
			records.shift(); // header
			records.map(record => statement.run(record));
		});
		for (let sensor of this.sensors) {
			let recordsFiles = globSync(path.join(`./data/sensor-${sensor.id}`, '*.csv'));
			recordsFiles.sort();
			for (let file of recordsFiles) {
				const match = path.basename(file).match(/^sensor-(\d+)-(\d+)-(\d+).csv$/);
				if (!match) {
					continue;
				}
				const sensorId = parseInt(match[1]);
				const startTimestamp = parseInt(match[2]);
				const endTimestamp = parseInt(match[3]);
				if (this.alreadyIndexed(sensorId, startTimestamp, endTimestamp)) {
					// console.log(`skipping ${file} (${this.formatDate(startTimestamp)} - ${this.formatDate(endTimestamp)})`);
					continue;
				}
				console.log(`indexing ${file}`);
				const csvData = fs.readFileSync(file, 'utf8');
				const data = parse(csvData, {
					skip_empty_lines: true
				});
				insertRecords(data);
			}
		}
	}

	alreadyIndexed(sensorId, startTimestamp, endTimestamp) {
		if (!this.indexRange) {
			this.indexRange = {};
		}
		if (!this.indexRange[sensorId]) {
			const startIndexed = this.index.prepare(`
				SELECT time_stamp
				FROM record
				WHERE sensor_id = ?
				ORDER BY time_stamp
				LIMIT 1
			`).get([sensorId]);
			const endIndexed = this.index.prepare(`
				SELECT time_stamp
				FROM record
				WHERE sensor_id = ?
				ORDER BY time_stamp DESC
				LIMIT 1
			`).get([sensorId]);
			if (!startIndexed || !endIndexed) {
				return false;
			}
			this.indexRange[sensorId] = {
				start: parseInt(startIndexed.time_stamp),
				end: parseInt(endIndexed.time_stamp)
			};
		}
		return (startTimestamp >= this.indexRange[sensorId].start &&
		        endTimestamp <= this.indexRange[sensorId].end);
	}

	migrateDatabase() {
		let dbVersion = this.index.pragma('user_version', { simple: true });
		let migrationsDir = './db';
		let migrations = globSync(path.join(migrationsDir, '*.sql'));
		migrations.sort();
		for (let file of migrations) {
			let versionMatch = path.basename(file).match(/\d+/);
			if (versionMatch) {
				let migrationVersion = parseInt(versionMatch[0]);
				if (dbVersion < migrationVersion) {
					console.log(`migrating index db: ${versionMatch[0]}`);
					this.index.transaction(() => {
						let sql = fs.readFileSync(file, 'utf8');
						this.index.exec(sql);
					})();
				}
				this.index.pragma(`user_version = ${migrationVersion}`);
			}
		}
		return this.index;
	}

	saveTimeSeries() {
		let sensors = [];
		const threshold = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
		const getRecords = this.index.prepare(`
			SELECT sensor_id, time_stamp, pm25_atm_a, pm25_atm_b
			FROM record
			WHERE time_stamp > ?
			ORDER BY time_stamp
		`);
		const series = {};
		const records = getRecords.all([threshold]);
		for (let record of records) {
			let date_time = new Date(parseInt(record.time_stamp) * 1000);
			date_time.setMilliseconds(0);
			date_time.setSeconds(0);
			const minuteBin = Math.floor(date_time.getMinutes() / 10) * 10;
			date_time.setMinutes(minuteBin);
			date_time = date_time.toJSON().replace('.000Z', 'Z');
			if (!series[date_time]) {
				series[date_time] = {};
			}
			if (!series[date_time][record.sensor_id]) {
				series[date_time][record.sensor_id] = [];
			}
			series[date_time][record.sensor_id].push(record.pm25_atm_a);
			series[date_time][record.sensor_id].push(record.pm25_atm_b);
			if (sensors.indexOf(record.sensor_id) < 0) {
				sensors.push(record.sensor_id);
			}
		}
		sensors.sort();

		const date_times = Object.keys(series).sort();
		let count = 0;
		const output = [
			['date_time', ...sensors]
		];
		for (let date_time of date_times) {
			let row = [date_time];
			for (let sensor_id of sensors) {
				row.push(this.getAverage(series[date_time][sensor_id]));
			}
			output.push(row);
			count++;
		}

		let cols = null;
		for (let line of output) {
			if (!cols) {
				cols = line.length;
				console.log(`${cols} cols.`);
			} else if (line.length != cols) {
				console.log(line);
			}
		}
		fs.writeFileSync('./data/time-series.csv', stringify(output), 'utf8');
		console.log(`Wrote ${count} rows to time-series.csv`);
	}

	getAverage(numbers) {
		if (typeof numbers == 'undefined') {
			return '-';
		}
		let sum = 0.0;
		for (let number of numbers) {
			sum += parseFloat(number);
		}
		return (sum / numbers.length).toFixed(2);
	}
}
