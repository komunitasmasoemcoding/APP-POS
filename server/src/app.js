import express from 'express';
import dotenv from 'dotenv';
import appMiddleware from './middlewares/index.js';

dotenv.config();

export const app = express();

app.use('/public', express.static('public'));
app.use(appMiddleware);
