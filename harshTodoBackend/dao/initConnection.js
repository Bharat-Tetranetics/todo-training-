"use strict";
const sql = require("mssql");
const log = require("../logger/loggerService.js");
const process = require("process");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));
const dbConfig = configuration.dbInfo;

/**
 * Create a new pool for connection to mssql database.
 * */
let pool;
if (configuration?.dbInfo?.isDatabaseNeeded) {
  pool = new sql.ConnectionPool(dbConfig, function (err) {
    if (err) {
      log.logger.error(`Error while connecting to database \n
            Error: ${err.stack}\n
            Error Code: ${err.code}\n
            Original error: ${err.originalError}\n
            Preceding error: ${err.precedingErrors}\n
            Error Name: ${err.name}\n
            Error Code: ${err.code}\n
            Error Message: ${err.message}\n
            Error Number: ${err.number}\n
            Error State: ${err.state}\n
            Error Class: ${err.class}\n
            Error Line number: ${err.lineNumber}\n
            Error Server Name: ${err.serverName}\n
            Error Procedure Name: ${err.procName}`);
      console.log(err);
    } else {
      console.log("Successfully connected to database");
    }
  });
}
var initialized = true;

async function reinitPool() {
  initialized = false;
  await pool.close();
  pool = new sql.ConnectionPool(dbConfig, function (err) {
    initialized = true;
    if (err) {
      log.logger.error(`Error while connecting to database \n
            Error: ${err.stack}\n
            Error Code: ${err.code}\n
            Original error: ${err.originalError}\n
            Preceding error: ${err.precedingErrors}\n
            Error Name: ${err.name}\n
            Error Code: ${err.code}\n
            Error Message: ${err.message}\n
            Error Number: ${err.number}\n
            Error State: ${err.state}\n
            Error Class: ${err.class}\n
            Error Line number: ${err.lineNumber}\n
            Error Server Name: ${err.serverName}\n
            Error Procedure Name: ${err.procName}`);
    } else {
      console.log("Successfully connected to database");
      module.exports.pool = pool;
    }
  });
}

async function dbPoolConnect() {
  await pool.connect();
}

module.exports.initialized = initialized;
module.exports.pool = pool;
module.exports.poolConnect = dbPoolConnect;
module.exports.reinitPool = reinitPool;
