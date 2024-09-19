// netlify/functions/error-handler.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

exports.handler = async function(event, context) {
  try {
    // 실제 함수 로직
  } catch (error) {
    logger.error('An error occurred', { error });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An unexpected error occurred' })
    };
  }
};