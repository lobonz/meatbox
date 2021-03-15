var logger = require('winston');

logger.createLogger({
  level: 'info',
  format: logger.format.combine(
    logger.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    logger.format.errors({ stack: true }),
    logger.format.splat(),
    logger.format.json()
  ),
  defaultMeta: { service: 'MeatFridge' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new logger.transports.File({ filename: 'error.log', level: 'error'}),
    new logger.transports.File({ filename: 'combined.log'})
  ]
});

// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.

if (process.env.NODE_ENV !== 'production') {
  logger.add(new logger.transports.Console({
    format: logger.format.combine(
      logger.format.colorize({ all: true }),
      logger.format.simple()
    )
  }))
}

module.exports = logger;

