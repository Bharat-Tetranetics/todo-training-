"use strict";
const express = require("express");
const router = express.Router();
const AuthController = require("../controller/authController.js");
const UserController = require("../controller/userController.js");
const path = require("path");
const TodoController = require("../controller/todoController.js");
const configuration = require(path.join(process.cwd(), "./configuration"));

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

// Get all todos API
router.get("/allTodos", function (req, res) {
  TodoController.allTodos(req, res);
});

// Create Single Todo API
router.post("/createTodo", function (req, res) {
  console.log(req.body);
  TodoController.createTodo(req, res);
});

// Delete Single Todo
router.delete("/deleteTodo/:todoId", function (req, res) {
  TodoController.deleteTodo(req, res);
});

// Filter by Status | Either 'Pending' or 'Completed'
router.get("/filterTodo/:status", function (req, res) {
  TodoController.filterTodo(req, res);
});

// Search using Query
router.post("/search", function (req, res) {
  TodoController.search(req, res);
});

router.post("/searchAndFilter", function (req, res) {
  TodoController.searchAndFilter(req, res);
});

module.exports = router;
