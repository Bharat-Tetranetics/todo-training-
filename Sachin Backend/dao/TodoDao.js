const daoLink = require("./query.js");
const sql = require("mssql");

module.exports.getAllTodos = function () {
  let selQ = `SELECT * from TodoBySachin`;

  return daoLink.queryDb(selQ);
};

module.exports.createTodo = function (todo) {
  console.log(
    "Checking backend",
    todo.TaskName,
    todo.Username,
    todo.TaskStatus
  );

  let selQ = `
        INSERT INTO TodoBySachin (TaskName, Username, TaskStatus)
        OUTPUT INSERTED.* VALUES (@TaskName, @Username, @TaskStatus)
    `;

  const qParams = [
    { dParam: "TaskName", dType: sql.VarChar(255), dVal: todo.TaskName },
    { dParam: "Username", dType: sql.VarChar(100), dVal: todo.Username },
    { dParam: "TaskStatus", dType: sql.VarChar(50), dVal: todo.TaskStatus }
  ];

  return daoLink.queryDb(selQ, qParams);
};

module.exports.deleteTodo = function (id) {
  // console.log("Checking:: ", id);
  let delQ = `DELETE FROM TodoBySachin OUTPUT DELETED.* WHERE TaskID = @id`;

  const qParams = [{ dParam: "id", dType: sql.Int, dVal: id }];

  return daoLink.queryDb(delQ, qParams);
};

module.exports.filterTodo = function (status) {
  console.log("At dao:: ");

  let filterQuery = `SELECT * FROM TodoBySachin WHERE TaskStatus = @status`;

  const qParams = [{ dParam: "status", dType: sql.VarChar(50), dVal: status }];

  return daoLink.queryDb(filterQuery, qParams);
};

module.exports.searchTodo = function (query) {
  let searchQuery = `SELECT * from TodoBySachin
      WHERE TaskName LIKE @query`;

  // const searchQuery = `
  //   SELECT * FROM TodoBySachin
  //   WHERE TaskName COLLATE SQL_Latin1_General_CP1_CI_AS LIKE @query
  // `;

  const qParams = [
    {
      dParam: "query",
      dType: sql.VarChar(255),
      dVal: `%${query}%`
    }
  ];

  return daoLink.queryDb(searchQuery, qParams);
};

module.exports.searchAndFilter = function (query, status) {
  console.log("Status : ", status);
  console.log("Query : ", query);

  //   let filterAndSearchQuery = `SELECT * FROM TodoBySachin
  //     WHERE TaskName LIKE @query
  //     AND TaskStatus = @status`;

  let filterAndSearchQuery = `
    SELECT * FROM TodoBySachin
    WHERE TaskName COLLATE SQL_Latin1_General_CP1_CI_AS LIKE @query
    AND TaskStatus COLLATE SQL_Latin1_General_CP1_CI_AS = @status
  `;

  const qParams = [
    {
      dParams: "query",
      dType: sql.VarChar(255),
      dVal: `%${query}%`
    },
    {
      dParams: "status",
      dType: sql.VarChar(50),
      dVal: status
    }
  ];

  return daoLink.queryDb(filterAndSearchQuery, qParams);
};
