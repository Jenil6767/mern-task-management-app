import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  if (env.nodeEnv !== 'test') {
    // basic logging
    // eslint-disable-next-line no-console
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      status,
      path: req.path,
    });
  }

  const response = {
    status: 'error',
    message,
  };

  if (env.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};


