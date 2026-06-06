import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const port = process.env.PORT || 3600;

app.listen(port, () => {
  console.info(`Server is running on port http://localhost:${port}`);
});
