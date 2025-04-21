"use strict";
const daoLink = require("./query.js");
const sql = require("mssql");
const path = require("path");
const configuration = require(path.join(process.cwd(), "./configuration"));
const appName = configuration.dbInfo.appName;

//function creates the version control table if it does not exist
module.exports.createVersionControlTable = function () {
  const createTableQuery = `CREATE TABLE db_version_control (
    id INT IDENTITY(1,1) PRIMARY KEY,
    productName VARCHAR(100) NOT NULL UNIQUE,  
    latestVersion varchar(100) NOT NULL,
    LastUpdated DATETIME DEFAULT GETDATE())`;
  return daoLink.queryDb(createTableQuery);
};

//This function returns the app version data from version control table
//here the product name is Name of the application
module.exports.getVersionControlTableData = function () {
  let selQ = `SELECT * FROM db_version_control  where productName = @productName`;
  let qParams = [
    {
      dParam: "productName",
      dType: sql.VarChar(100),
      dVal: appName
    }
  ];
  return daoLink.queryDb(selQ, qParams);
};

//function used for updating the appVersion in the database
//latest_query_version is version of the query calculated from the versions file
module.exports.updateProductVersionInDb = function (latest_query_version) {
  const updateQuery = `
  UPDATE db_version_control 
  SET latestVersion = @latestVersion
  WHERE productName = @productName
`;
  const params = [
    {
      dParam: "latestVersion",
      dType: sql.VarChar(100),
      dVal: latest_query_version.toString()
    },
    {
      dParam: "productName",
      dType: sql.VarChar(100),
      dVal: appName
    }
  ];
  return daoLink.queryDb(updateQuery, params);
};

//Function creates and inserts the intial data
//latest_query_version is version of the query calculated from the versions file
module.exports.insertInitialProductData = function (latest_query_version) {
  const insertQuery = `INSERT INTO db_version_control (productName, latestVersion) VALUES (@productName,@latestVersion)`;
  return daoLink.queryDb(insertQuery, [
    {
      dParam: "productName",
      dType: sql.VarChar(100),
      dVal: appName
    },
    {
      dParam: "latestVersion",
      dType: sql.VarChar(100),
      dVal: latest_query_version.toString()
    }
  ]);
};

//function check tableExists
module.exports.checkTableExists = function (tableName) {
  const checkTableQuery = `
  IF OBJECT_ID('${tableName}', 'U') IS NULL
    BEGIN 
      SELECT 0 AS TableExists
    END
  ELSE
    BEGIN
      SELECT 1 AS TableExists
    END
`;
  return daoLink.queryDb(checkTableQuery);
};

//function to check views exists
module.exports.checkViewExists = function (viewName) {
  //query to check view exist
  const checkViewQuery = `
  IF OBJECT_ID('${viewName}', 'V') IS NULL
  BEGIN 
    SELECT 0 AS ViewExists
  END
  ELSE
  BEGIN
    SELECT 1 AS ViewExists
  END
`;
  return daoLink.queryDb(checkViewQuery);
};

//queries are executed here
module.exports.QueryExecution = function (query) {
  return daoLink.queryDb(query);
};
