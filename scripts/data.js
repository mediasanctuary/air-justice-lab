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
				continue;
			}
			files.sort();
			const first = files[0];
			const last = files[files.length - 1];
			this.timestamps[sensor.id] = {
				start: parseInt(first.match(/sensor-\d+-(\d+)-\d+\.csv$/)[1]),
				end: parseInt(last.match(/sensor-\d+-\d+-(\d+)\.csv$/)[1])
			};
		}
	}

	async load() {
		for (let sensor of this.index) {
			const timestamp = this.timestamps[sensor.id];
			this.save(sensor, await this.loadBackward(sensor, timestamp.start));
			await new Promise(resolve => setTimeout(resolve, 1000));
			this.save(sensor, await this.loadForward(sensor, timestamp.end));
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	async loadBackward(sensor, startTimestamp) {
		process.stdout.write(`Loading "${sensor.name}" (${sensor.id}) before ${startTimestamp}\n`);
		const rsp = await getSensorHistory(sensor.id, {
			fields: this.fields.join(','),
			end_timestamp: startTimestamp
		});
		return rsp;
	}

	async loadForward(sensor, endTimestamp) {
		process.stderr.write(`Loading "${sensor.name}" (${sensor.id}) after ${endTimestamp}\n`);
		const rsp = await getSensorHistory(sensor.id, {
			fields: this.fields.join(','),
			start_timestamp: endTimestamp + 1
		});
		return rsp;
	}

	save(sensor, rsp) {
		if (!rsp.data) {
			process.stderr.write(`No data found: ${JSON.stringify(rsp)}`);
			return;
		}
		if (rsp.data.length == 0) {
			process.stderr.write('No records found\n');
			return;
		}
		const header = ['sensor_index', 'time_stamp', ...this.fields];
		const dirname = `./data/sensor-${sensor.id}`;
		if (!fs.existsSync(dirname)) {
			fs.mkdirSync(dirname, 0o755);
		}
		const filename = `${dirname}/sensor-${sensor.id}-${rsp.start_timestamp}-${rsp.end_timestamp}.csv`;
		const rows = this.getRows(rsp, header);
		fs.writeFileSync(filename, stringify([header, ...rows]), 'utf8');
		process.stderr.write(`Saved ${rows.length} records ${this.timeRange(rsp)}\n`);
	}

	getRows(rsp, columns) {
		return rsp.data.map(values => {
			let row = [];
			for (let column of columns) {
				if (column == 'sensor_index') {
					row.push(rsp.sensor_index)
				} else {
					let index = rsp.fields.indexOf(column);
					let value = values[index];
					if (column == 'pm2.5_atm') {
						value = value.toFixed(2); // two decimal precision
					}
					row.push(value);
				}
			}
			return row;
		}).reverse();
	}

	timeRange(rsp) {
		const start = this.formatDate(rsp.start_timestamp);
		const end = this.formatDate(rsp.end_timestamp);
		return `${start} to ${end}`;
	}

	formatDate(timestamp) {
		const date = new Date(timestamp * 1000);
		return date.toJSON().replace('.000Z', '');
	}
}
