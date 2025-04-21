const TodoService = require("../service/TodoService.js");
const utilFunc = require("../service/utilFuncs");
const log = require("../logger/loggerService");

module.exports.allTodos = async function (req, res) {
  TodoService.getAllTodos(req, res);
};

module.exports.createTodo = async function (req, res) {
  const { Username, TaskName, TaskStatus } = req.body;
  console.log("Body :", Username, TaskName, TaskStatus);

  if (!Username || !TaskName || !TaskStatus) {
    log.logCompleteError(req.url, "All Fields are required!");
    utilFunc.SendErrorResponse(res, "All Fields are required!");
    return;
  }

  const todo = { Username, TaskName, TaskStatus };

  TodoService.createTodo(req, res, todo);
};

module.exports.deleteTodo = async function (req, res) {
  const id = req.params.todoId;
  console.log(id);

  if (!id) {
    log.logCompleteError(req.url, "Todo ID is required");
    utilFunc.SendErrorResponse(res, "Todo ID is required!");
    return;
  }

  TodoService.deleteTodo(req, res, id);
};

module.exports.filterTodo = async function (req, res) {
  const status = req.params.status;
  console.log(status);

  if (!status || (status !== "Pending" && status !== "Completed")) {
    log.logCompleteError(req.url, "Status must be 'Pending' or 'Completed'");
    utilFunc.SendErrorResponse(res, "Status must be 'Pending' or 'Completed'");
    return;
  }

  TodoService.filterTodo(req, res, status);
};

module.exports.search = async function (req, res) {
  const { query } = req.body;
  console.log(query);

  if (!query) {
    log.logCompleteError(req.url, "Search query is required");
    utilFunc.SendErrorResponse(res, "Search query is required");
    return;
  }

  TodoService.search(req, res, query);
};

module.exports.searchAndFilter = async function (req, res) {
  const { query, status } = req.body;

  //   console.log("Checking ", query, status);

  if (!query || !status || (status !== "Pending" && status !== "Completed")) {
    log.logCompleteError(req.url, "Search & Status is required");
    utilFunc.SendErrorResponse(res, "Search & Status is required");
    return;
  }

  TodoService.searchAndFilter(req, res, query, status);
};
