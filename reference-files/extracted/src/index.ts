import { App } from './app';
import { logger } from './logger';

(async () => {
    logger.info('INITIALIZING APP');

    const app = new App();
    await app.init();

    logger.info('APP IS INITIALIZED');
})().catch((err) => logger.error(err));
