import express from 'express';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

export function createApp() {
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buffer) => {
        (req as express.Request).rawBody = buffer.toString('utf8');
      }
    })
  );
  app.use('/api/v1', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
