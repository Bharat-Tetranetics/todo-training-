`use strict`;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const UserDao = require("../dao/UserDao");
const utilFunc = require("../service/utilFuncs");
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));

//Bcrypt Encrypt Logic
async function EncryptPass(body) {
  let HashPass = await bcrypt.hash(body.Extn_Passwd, saltRounds);
  return HashPass;
}

//Bcrypt Password compare function
async function DecryptPass(pass, hash) {
  let IsValid = await bcrypt.compare(pass, hash);
  return IsValid;
}

//Login service function
module.exports.LoginServFunction = async function (req, res) {
  try {
    let USer = await UserDao.getUser(req.body);
    if (USer.recordset.length == 0) {
      req.session.destroy();
      utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.AuthError);
      return;
    }
    //Helps to decrypt db password and check
    let IsValid = await DecryptPass(
      req.body.Extn_Passwd,
      USer.recordset[0].Extn_Passwd
    );
    if (IsValid) {
      //Helps to store information in session
      if (req.session) {
        await utilFunc.regenerateSession(req);
        req.session.Extn_No = USer.recordset[0].Extn_No;
        req.session.Extn_Token = USer.recordset[0].Extn_Token;
        req.session.Extn_role = USer.recordset[0].Extn_role;
        req.session.lStatus = true;
      }
      let UserData = {
        Name: USer.recordset[0].Extn_Name,
        Role: USer.recordset[0].Extn_role,
        Menu: USer.recordset[0].Extn_Token
      };
      utilFunc.SendSuccessResponse(res, UserData);
      return;
    } else {
      req.session.destroy();
      utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.AuthError);
      return;
    }
  } catch (error) {
    req.session.destroy();
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.DecryptPass = DecryptPass;
module.exports.EncryptPass = EncryptPass;
