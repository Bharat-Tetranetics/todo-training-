"use strict";

const daoLink = require("./query.js");
const sql = require("mssql");

module.exports.getTodoList = function (filter) {
  const {searchParam,status}=filter
  let selQ = `select * from Todos 
 where id is not null 
 ${status ? `AND status = @Status 
 ` : ""}
 ${
   searchParam
     ? `AND (task like '%@searchParam%' OR username like '%@searchParam%'  ) `
     : ""
 }
 `;
  let qParams = [
    { dParam: "Status", dType: sql.VarChar(50), dVal: status },
    { dParam: "searchParam", dType: sql.VarChar(50), dVal: searchParam },

  ];
  return daoLink.queryDb(selQ, qParams);
};

module.exports.updateTodoStatus=function(updateObj){
  const {id,status}=updateObj;
  let selQ = `update Todos set status=@Status OUTPUT INSERTED.* where id=@Id`;
  let qParams = [
    { dParam: "Id", dType: sql.Int, dVal: id },
    { dParam: "Status", dType: sql.VarChar(50), dVal: status }
  ];
  return daoLink.queryDb(selQ, qParams);
};

module.exports.updateTodoTask=function(updateObj){
  const {id,task}=updateObj;
  let selQ = `update Todos set task=@Task OUTPUT INSERTED.* where id=@Id`;
  let qParams = [
    { dParam: "Id", dType: sql.Int, dVal: id },
    { dParam: "Task", dType: sql.VarChar(50), dVal: task }
  ];
  return daoLink.queryDb(selQ, qParams);
};

module.exports.deleteTodo=function(id){
  let selQ = `delete from Todos OUTPUT DELETED.*  where id=@Id`;
  let qParams = [
    { dParam: "Id", dType: sql.Int, dVal: id },
  ];
  return daoLink.queryDb(selQ, qParams);
};

module.exports.addTodo=function(addObj){
  const {task,username}=addObj;
  let selQ = `INSERT INTO Todos (task, username, status,priority)
    OUTPUT INSERTED.*
     VALUES (@Task, @Username, 'Pending','high');`;
  let qParams = [
    { dParam: "Task", dType: sql.VarChar(50), dVal: task },
    { dParam: "Username", dType: sql.VarChar(50), dVal: username }
  ];
  return daoLink.queryDb(selQ, qParams);
};
