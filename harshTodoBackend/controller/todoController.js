`use strict`;
const TodoService=require('../service/TodoService');
const path = require("path");
const MessageConfig = require(path.join(process.cwd(), "./messageConfig.js"));
const log = require('../logger/loggerService');
const utilFunc = require('../service/utilFuncs');

module.exports.getTodo= async function(req,res){
     const { searchParam, status  } = req.query;
     
    const validStatus=['Completed','Pending'];
     if(status && !validStatus.includes(status))  
        {
          utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
           return;
       }
       if(searchParam && searchParam.length >50)  
        {
          utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
           return;
       }

       TodoService.getTodo(req,res,{searchParam,status});

}

module.exports.addTodo= async function(req,res){
  const {  username, task  } = req.body;
  
  if( !username || !task)  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }
    if(task.length>50 || username.length>20)  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }

    TodoService.addTodo(req,res,{username,task});

}

module.exports.updateTodoStatus= async function(req,res){
  const {  id, status} = req.body;
  console.log(id,"--------------------",status);
  const validStatus=['Completed','Pending'];
  if( !id || !status)  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }
    if(!validStatus.includes(status))  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }

    TodoService.updateTodoStatus(req,res,{id,status});

}

module.exports.updateTodoTask= async function(req,res){
  const {  id,task  } = req.body;

  if( !id || !task || task.length>50)  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }

    TodoService.updateTodoTask(req,res,{id,task});

}

module.exports.deleteTodo= async function(req,res){
  const { id } = req.params;

  if( !id )  
     {
       utilFunc.SendErrorResponse(res,MessageConfig.ErrorMessage.ValidationError);
        return;
    }

    TodoService.deleteTodo(req,res,id);

}
