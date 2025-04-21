'use strict';
const AuthServ = require('../service/AuthService');
const utilFunc = require('../service/utilFuncs');
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));
const log = require('../logger/loggerService');
/**
 * Req Body
{
  "Extn_Login":"Admin",
  "Extn_Passwd":"Admin"
}
 */
//Log in function
module.exports.LoginFunction=async function(req,res){
    if(!req.body.Extn_Login){
      utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.AuthError);
      return;
    }
    if(!req.body.Extn_Passwd){
      utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.AuthError);
      return;
    }
    AuthServ.LoginServFunction(req,res);
}


//Log out function
module.exports.LogOutFunc= async function(req,res){
  try {
    if(req.session){
      req.session.destroy();
    }
    utilFunc.SendSuccessResponse(res,'Logout Successfully!');
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ServerError);
  }
}
