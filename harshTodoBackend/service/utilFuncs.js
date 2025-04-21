"use strict";

const log = require("../logger/loggerService.js");
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));

module.exports.logAndSendErr = function (req, err, res, msgVal) {
  //console.log(err);//this should be commented for prod

  log.logCompleteError(req.url, err);

  res.send({
    success: false,

    err: msgVal //"Unexpected error occured while retrieving from database. Please try again."
  });
};

module.exports.logCustSendErr = function (req, err, res, msgVal) {
  // console.log(err);//this should be commented for prod

  log.logger.error(err);

  res.send({
    success: false,

    err: msgVal //"Unexpected error occured while retrieving from database. Please try again."
  });
};

module.exports.isValidDate = function (dateObject) {
  if (Object.prototype.toString.call(dateObject) === "[object Date]") {
    if (isNaN(dateObject.getTime())) {
      return null;
    } else {
      return dateObject;
    }
  } else {
    return null;
  }
};

module.exports.convertDateFormat = function (inputDate) {
  // Split the input date string into day, month, and year components
  const parts = inputDate.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  const formattedDate = `${month}-${day}-${year}`;

  return formattedDate;
};

/**

 * Utility function to ensure a field exists inside a

 * provided json value.

 * @param {any} res

 * @param {any} jsonVal

 * @param {any} keyVal

 * @param {any} errStr

 */

module.exports.checkIfFieldExists = function (res, jsonVal, keyVal, errStr) {
  if (!jsonVal.hasOwnProperty(keyVal) || !jsonVal[keyVal]) {
    res.send({
      success: false,

      err: errStr
    });

    return false;
  }

  return true;
};

async function checkForWrongSession(req, res) {
  if (!req.hasOwnProperty("session")) {
    SendErrorResponse(res, MessageConfig.ErrorMessage.sessionError);
    return true;
  } else if (req.session.lStatus != true) {
    req.session.destroy();
    SendErrorResponse(res, MessageConfig.ErrorMessage.sessionError);
    return true;
  }
  return false;
}
/**
 *
 * @param {*} res
 * @param {*recordset*} data
 */
async function SendSuccessResponse(res, data) {
  res.send({
    success: true,
    data: data
  });
}
/**
 *error example
 *  {
        "English": "Session has expired! Please login again",
        "Hindi": "सत्र समाप्त हो चुका है! कृपया फिर भाग लें",
        "ErrorCode": 401
    }
 * @param {*} res
 * @param {} error
 */
async function SendErrorResponse(res, error) {
  res.send({
    success: false,
    error: error
  });
}

// Utility function to make req.session.regenerate awaitable
module.exports.regenerateSession = async function (req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        log.logCompleteError("Error while regenerating session", err);
        return reject(err);
      }
      resolve();
    });
  });
};

module.exports.SendSuccessResponse = SendSuccessResponse;
module.exports.SendErrorResponse = SendErrorResponse;
module.exports.checkForWrongSession = checkForWrongSession;
