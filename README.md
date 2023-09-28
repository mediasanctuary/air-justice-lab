# Air Justice Lab

[Air Justice Lab](https://www.mediasanctuary.org/project/capital-region-air-justice-lab/) is a community air monitoring and educational initiative based at [NATURE Lab](https://www.mediasanctuary.org/initiatives/nature-lab/) and serving the greater Capital Region.

This repository archives historical air quality data (stored in the `data` directory) and scripts for archiving via the PurpleAir API (stored in the `scripts` directory).

## Dependencies

* node.js v18
* [PurpleAir API key](https://develop.purpleair.com/)

## Developer Setup

1. Run `npm install`
2. Copy `.env.example` to `.env` and replace `PURPLEAIR_API_KEY`
3. Run `npm start`

## Sensor list

The file `data/sensors.csv` has a list of Air Justice Lab affiliated PurpleAir sensors.

### sensors.csv columns

1. `id` - PurpleAir sensor identifier (`sensor_index` elsewhere)
2. `name` - the public sensor name

## Records

Each sensor's historical records are stored in `data/sensor-[id]` folders. Batches of records are stored in files named `sensor-[id]-[start timestamp]-[end timestamp].csv`.

### records columns

1. `sensor_index` - PurpleAir sensor ID
2. `timestamp` - Unix epoch timestamp
3. `pm2.5_alt_a` - pm2.5 A channel reading
4. `pm2.5_alt_b` - pm2.5 B channel reading
5. `temperature` - temperature in degrees Fahrenheit
6. `humidity` - relative percentage humidity
7. `pressure` - current pressure in Millibars

## Data Attribution

Source: [PurpleAir](https://map.purpleair.com/1/mAQI/a10/p604800/cC0#12.04/42.7431/-73.6769)

## References

* [Sensors - Get Sensor History](https://api.purpleair.com/#api-sensors-get-sensor-history)
* [What is the Difference Between CF=1, ATM, and ALT?](https://community.purpleair.com/t/what-is-the-difference-between-cf-1-atm-and-alt/6442)
