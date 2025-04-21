`use strict`;
const UserServ = require('../service/UserService');
const utilFunc = require('../service/utilFuncs');

module.exports.getUser = async function(req,res){
/**
 * Checking session
 * If session is expire then this fucntion will return true.
 */
    let WrongSession = await utilFunc.checkForWrongSession(req,res);
    if(WrongSession){
      return;
    }
    UserServ.getUserList(req,res);
}
