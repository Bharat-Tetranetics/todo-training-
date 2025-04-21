"use strict";
const dbConn = require("../dao/initConnection.js");
const sql = require("mssql");
const log = require("../logger/loggerService.js");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));
const config = configuration.dbInfo;

/**
 * Performs a query on the sql database
 * @param {string} queryStr - The query string. example - Select field1 from Table1 where val1=5
 * @param {array of objects} inputParams - [{dParam:"input_parameter"},{dType:sql.Int},{dVal: value}]
 */
var queryDb = (module.exports.queryDb = async function (queryStr, inputParams) {
  await checkConnectionHealth();
  await dbConn.poolConnect();
  var currReq = dbConn.pool.request();
  if (inputParams) {
    for (let iter = 0; iter < inputParams.length; iter++) {
      currReq = currReq.input(
        inputParams[iter].dParam,
        inputParams[iter].dType,
        inputParams[iter].dVal
      );
    }
  }
  return currReq.query(queryStr);
});

/**
 * Retries the given query. In case of failure, we set a timer and retry the query hoping for success.
 * In case number of retries become 0 and there is a failure we log the query for manual updation
 * @param {string} queryStr - The query string. example - Select field1 from Table1 where val1=5
 * @param {array of objects} inputParams - [{dParam:"input_parameter"},{dType:sql.Int},{dVal: value}]
 * @param {int} retryTimes - Number of times the request has to be retried before logging the error for manual updation
 * @param {int} slpTimeVal - Time for which the timer will sleep before retrying
 */
var retryQuery = (module.exports.retryQuery = async function (
  queryStr,
  inputParams,
  retryTimes,
  slpTimeVal
) {
  queryDb(queryStr, inputParams)
    .then((result) => {
      //retry query successful!
    })
    .catch((err) => {
      if (retryTimes > 0) {
        setTimeout(
          retryQuery,
          slpTimeVal,
          queryStr,
          inputParams,
          retryTimes - 1,
          2 * slpTimeVal
        );
      } else {
        log.logger.error(
          `Failed to complete sql query: ${queryStr} InputParams:${JSON.stringify(
            inputParams
          )} due to error ${JSON.stringify(err)}`
        );
      }
    });
});

/**
 * Multiple queries are retried one after another till either all are successful or 1 fails.
 * */
var retryQueryMultiple = (module.exports.retryQueryMultiple = async function (
  queryInfo,
  retryTimes,
  slpTimeVal
) {
  queryDb(queryInfo.queryStr, queryInfo.inputParams)
    .then((result) => {
      //retry query successful so try next query
      if (queryInfo.nextQ) {
        retryQueryMultiple(queryInfo.nextQ, 5, 5000);
      }
    })
    .catch((err) => {
      if (retryTimes > 0) {
        setTimeout(
          retryQueryMultiple,
          slpTimeVal,
          queryInfo,
          retryTimes - 1,
          2 * slpTimeVal
        );
      } else {
        log.logger.error(
          `Failed to complete sql query: ${queryStr} InputParams:${JSON.stringify(
            inputParams
          )} due to error ${JSON.stringify(err)}`
        );
      }
    });
});

/**
 * This will retry query until data is obtained. Otherwise the query is retried till retryTimes becomes 0.
 */
var retryQueryGetData = (module.exports.retryQueryGetData = async function (
  queryStr,
  inputParams,
  retryTimes,
  slpTimeVal
) {
  return new Promise((resolve, reject) => {
    return queryDb(queryStr, inputParams)
      .then((obtVal) => resolve(obtVal))
      .catch((reason) => {
        if (retryTimes > 0) {
          return new Promise((r) => setTimeout(r, slpTimeVal))
            .then(
              retryQueryGetData.bind(
                null,
                queryStr,
                inputParams,
                retryTimes - 1,
                2 * slpTimeVal
              )
            )
            .then((obtVal) => resolve(obtVal))
            .catch(reject);
        }
        return reject(reason);
      });
  });
});

module.exports.execStoredProcedure = async function (
  procedureName,
  inputParams,
  outputParams
) {
  await checkConnectionHealth();
  await dbConn.poolConnect();
  var currReq = dbConn.pool.request();
  if (inputParams) {
    for (let iter = 0; iter < inputParams.length; iter++) {
      currReq = currReq.input(
        inputParams[iter].dParam,
        inputParams[iter].dType,
        inputParams[iter].dVal
      );
    }
  }
  if (outputParams) {
    for (let iter = 0; iter < outputParams.length; iter++) {
      currReq = currReq.output(
        outputParams[iter].dParam,
        outputParams[iter].dType
      );
    }
  }
  return currReq.execute(procedureName);
};

/**
 * In case of error in sql query, this function checks the health of sql database and reconnects
 */
async function checkConnectionHealth() {
  if (!dbConn.pool.healthy && dbConn.initialized) {
    dbConn.initialized = false;
    await dbConn.pool.close();
    dbConn.pool = new sql.ConnectionPool(config, function (err) {
      dbConn.initialized = true;
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
        //remove statement when in prod
        console.log("Successfully connected to database");
        log.logger.info("Reconnected to database successfully");
      }
    });
  }
  return;
}

module.exports.checkConnectionHealth = checkConnectionHealth;
