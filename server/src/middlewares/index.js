import express from 'express';
import cors from 'cors';
import router from '../routes/index.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { errorHandler } from './error.js';

const appMiddleware = express();
const swaggerDocument = YAML.load('./doc/user.yaml');


appMiddleware.use(
    cors({
            origin: true,
            credentials: true,
            preflightContinue: false,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
        }
    )
);
appMiddleware.options('/*splat', cors());
appMiddleware.use(express.json());
appMiddleware.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
appMiddleware.use(router);
appMiddleware.use(errorHandler);

export default appMiddleware;
