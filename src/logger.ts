import * as winston from "winston";
import * as path from "path";

const { combine, timestamp, printf, colorize, align } = winston.format;

const format = combine(
  colorize({ all: true }),
  timestamp({
    format: "YYYY-MM-DD hh:mm:ss.SSS A"
  }),
  align(),
  printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

const logger = winston.createLogger({
  transports: [
    // info console log
    new winston.transports.Console({
      level: "info",
      format: format
    }),
    // info log file
    new winston.transports.File({
      level: "info",
      filename: path.resolve(__dirname, "./logs", "development-info.log"),
      format
    }),
    // errors console log
    new winston.transports.Console({
      level: "error",
      format
    }),
    // errors log file
    new winston.transports.File({
      level: "error",
      filename: path.resolve(__dirname, "./logs", "development-errors.log"),
      format
    })
  ]
});

export default logger;
