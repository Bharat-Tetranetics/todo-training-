const TodoDao = require("../dao/todoDao");
const utilFunc = require("../service/utilFuncs");
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));
const log = require("../logger/loggerService");

module.exports.getTodo = async function (req, res , filter) {
  try {
   
    let Todo = await TodoDao.getTodoList(filter);
    utilFunc.SendSuccessResponse(res, Todo.recordset);
  } catch (error) {
    console.log(error);
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.addTodo = async function (req, res , addObj) {
  try {
   
    let Todo = await TodoDao.addTodo(addObj);
    utilFunc.SendSuccessResponse(res, Todo.recordset);
  } catch (error) {
    console.log(error);
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.updateTodoStatus = async function (req, res , updateObj) {
  try {
   
    let Todo = await TodoDao.updateTodoStatus(updateObj);
    if(!Todo.recordset.length){
      utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.NotFoundError);
      return
    }
    utilFunc.SendSuccessResponse(res, Todo.recordset);
  } catch (error) {
    console.log(error);
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.updateTodoTask = async function (req, res , updateObj) {
  try {
   
    let Todo = await TodoDao.updateTodoTask(updateObj);
    if(!Todo.recordset.length){
      utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.NotFoundError);
      return
    }
    utilFunc.SendSuccessResponse(res, Todo.recordset);
  } catch (error) {
    console.log(error);
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.deleteTodo = async function (req, res , id) {
  try {
   
    let Todo = await TodoDao.deleteTodo(id);
    if(!Todo.recordset.length){
      utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.NotFoundError);
      return
    }
    utilFunc.SendSuccessResponse(res, Todo.recordset);
  } catch (error) {
    console.log(error);
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};



