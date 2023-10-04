CREATE TABLE record (
	sensor_id INTEGER,
	time_stamp INTEGER,
	pm25_alt_a REAL,
	pm25_alt_b REAL,
	pm25_atm_a REAL,
	pm25_atm_b REAL,
	pm25_cf_1_a REAL,
	pm25_cf_1_b REAL,
	temperature REAL,
	humidity REAL,
	pressure REAL
);

CREATE INDEX record_idx ON record (sensor_id, time_stamp, pm25_atm_a, pm25_atm_b);
