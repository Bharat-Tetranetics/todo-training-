"use strict";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const winston = require("winston");
require("winston-daily-rotate-file");
const process = require("process");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));

/**
 * This is for printing to command line
 */
const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}]: ${message}`;
});

/**
 * Format options for log file such as name, size, etc.
 * */
let transportDirName = "./logs/" + process.pid;
let transport = new winston.transports.DailyRotateFile({
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  dirname: transportDirName,
  maxSize: "20m",
  maxFiles: "14d",
  eol: "\r\n"
});

/**
 * Setting the time zone
 */
const timezoned = () => {
  return new Date().toISOString().replace("T", " ").substr(0, 19);
};

const myWinstonOptions = {
  level: configuration.winstonLogLevel, //comment this line to enable info logs
  format: combine(
    timestamp({
      format: timezoned
    }),
    myFormat
  ),
  transports: [transport],
  silent: configuration.winstonDebuggerSilent
};

var logger = new winston.createLogger(myWinstonOptions);

/**
 *Exporting winston logger for usage
 **/
module.exports.logger = logger;

/**
 *@param {string} errStr - The query string. example - Select field1 from Table1 where val1=5
 * @param {error object} err - [{param:"input_parameter"},{type:sql.Int},{val: value}]
 */
module.exports.logCompleteError = function (urlVal, errVal) {
  logger.error(`url: ${urlVal} Error: ${JSON.stringify(errVal)} \n
      Error: ${errVal.stack}\n
      Error Code: ${errVal.code}\n
      Original error: ${errVal.originalError}\n
      Preceding error: ${errVal.precedingErrors}\n
      Error Name: ${errVal.name}\n
      Error Code: ${errVal.code}\n
      Error Message: ${errVal.message}\n
      Error Number: ${errVal.number}\n
      Error State: ${errVal.state}\n
      Error Class: ${errVal.class}\n
      Error Line number: ${errVal.lineNumber}\n
      Error Server Name: ${errVal.serverName}\n
      Error Procedure Name: ${errVal.procName}\n`);
};
