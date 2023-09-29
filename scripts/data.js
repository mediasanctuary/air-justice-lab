import { getSensorHistory } from "./api.js";
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { globSync } from 'glob';

export default class Data {

	constructor(fields) {
		this.fields = fields;
		this.setupIndex();
		this.setupTimestamps();
	}

	setupIndex() {
		const csvData = fs.readFileSync(`./data/sensors.csv`, 'utf8');
		this.index = parse(csvData, {
			columns: true,
			skip_empty_lines: true
		});
	}

	setupTimestamps() {
		this.timestamps = {};
		const now = Math.floor(Date.now() / 1000);
		for (let sensor of this.index) {
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

	async load() {
		const now = Math.floor(Date.now() / 1000);
		for (let sensor of this.index) {
			try {
				console.log(`Loading "${sensor.name}" (${sensor.id})`);
				const timestamp = this.timestamps[sensor.id];
				this.save(sensor, await this.loadBackward(sensor, timestamp.start));
				await new Promise(resolve => setTimeout(resolve, 1000));
				if (now - timestamp.end > 24 * 60 * 60) {
					// only load forward if at least 24 hours have passed
					this.save(sensor, await this.loadForward(sensor, timestamp.end));
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} catch(error) {
				console.error(`Error: ${error.message}\n`);
				await new Promise(resolve => setTimeout(resolve, 10000));
			}
		}
		this.saveIndex();
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

	save(sensor, rsp) {
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
		this.updateIndex(sensor, start, end);
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

	updateIndex(sensor, startTimestamp, endTimestamp) {
		const start = this.formatDate(startTimestamp);
		const end = this.formatDate(endTimestamp);
		if (!sensor.start || start < sensor.start) {
			sensor.start = start;
		}
		if (!sensor.end || end > sensor.end) {
			sensor.end = end;
		}
	}

	saveIndex() {
		const csvData = stringify(this.index, {
			header: true
		});
		fs.writeFileSync('./data/sensors.csv', csvData, 'utf8');
	}
}
