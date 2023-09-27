import Data from "./data.js";
import dotenv from "dotenv";

dotenv.config();

const data = new Data([
	'pm2.5_alt',
	'pm2.5_atm',
	'pm2.5_cf_1',
	'temperature',
	'humidity',
	'pressure'
]);
await data.load();
