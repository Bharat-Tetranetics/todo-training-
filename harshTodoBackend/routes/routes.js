"use strict";
const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController.js");
const UserController = require("../controller/userController.js");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));
 const TodoController= require('../controller/todoController.js')
router.post("/login", function (req, res) {
  AuthController.LoginFunction(req, res);
});
router.post("/logout", function (req, res) {
  AuthController.LogOutFunc(req, res);
});
router.post("/getUserList", function (req, res) {
  UserController.getUser(req, res);
});
router.get("/health", function (req, res) {
  res.send(`${configuration.ProjectName} Serve is up!`);
});
router.get('/todo', (req, res) => {
  TodoController.getTodo(req,res);
});
router.post('/todo', (req, res) => {
  TodoController.addTodo(req,res);
});
router.patch('/todo/status', (req, res) => {
  TodoController.updateTodoStatus(req,res);
});
router.patch('/todo/task', (req, res) => {
  TodoController.updateTodoTask(req,res);
});
router.delete('/todo/:id', (req, res) => {
  TodoController.deleteTodo(req,res);
});
module.exports = router;
