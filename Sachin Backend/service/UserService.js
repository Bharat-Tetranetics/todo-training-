const UserDao = require("../dao/UserDao");
const utilFunc = require("../service/utilFuncs");
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));
const log = require("../logger/loggerService");
/**
 * Dao Function ;
 */
module.exports.getUserList = async function (req, res) {
  try {
    let Users = await UserDao.getUserList();
    utilFunc.SendSuccessResponse(res, Users.recordset);
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};
