import Data from "./data.js";
import dotenv from "dotenv";

dotenv.config();

const data = new Data([
	'pm2.5_alt_a',
	'pm2.5_alt_b',
	'pm2.5_atm_a',
	'pm2.5_atm_b',
	'pm2.5_cf_1_a',
	'pm2.5_cf_1_b',
	'temperature',
	'humidity',
	'pressure'
]);
await data.load();
