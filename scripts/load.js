import data from './data.js';
import dotenv from 'dotenv';

dotenv.config();
await data.loadRecords();