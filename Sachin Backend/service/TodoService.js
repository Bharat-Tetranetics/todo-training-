const TodoDao = require("../dao/TodoDao.js");
const utilFunc = require("../service/utilFuncs");
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));
const log = require("../logger/loggerService");
const messageConfig = require("../messageConfig.js");

module.exports.getAllTodos = async function (req, res) {
  try {
    let todos = await TodoDao.getAllTodos();
    utilFunc.SendSuccessResponse(res, todos.recordset);
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
  }
};

module.exports.createTodo = async function (req, res, todo) {
  try {
    console.log("Inside Servies ", todo);

    const data = await TodoDao.createTodo(todo);

    utilFunc.SendSuccessResponse(res, data.recordset);
    return;
  } catch (error) {
    // console.log(error, "reached");
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, MessageConfig.ErrorMessage.ServerError);
    console.log("dkjsfljdfdlks------------", error);
  }
};

module.exports.deleteTodo = async function (req, res, id) {
  try {
    const data = await TodoDao.deleteTodo(id);

    utilFunc.SendSuccessResponse(res, data.recordset);
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, messageConfig.ErrorMessage.ServerError);
  }
};

module.exports.filterTodo = async function (req, res, status) {
  try {
    console.log("At filterTodo");

    const filterTodos = await TodoDao.filterTodo(status);

    utilFunc.SendSuccessResponse(res, filterTodos.recordset);
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, messageConfig.ErrorMessage.ServerError);
  }
};

module.exports.search = async function (req, res, query) {
  try {
    const filterTodos = await TodoDao.searchTodo(query);

    utilFunc.SendSuccessResponse(res, filterTodos.recordset);
  } catch (error) {
    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, messageConfig.ErrorMessage.ServerError);
  }
};

module.exports.searchAndFilter = async function (req, res, query, status) {
  try {
    const filterData = await TodoDao.searchAndFilter(query, status);

    utilFunc.SendSuccessResponse(res, filterData.recordset);
  } catch (error) {
    // console.log("Facing Error Here, ");

    log.logCompleteError(req.url, error);
    utilFunc.SendErrorResponse(res, messageConfig.ErrorMessage.ServerError);
  }
};
