const process = require("process");
const fs = require("fs");

process.on("uncaughtException", (err) => {
  var datetime = new Date();
  console.log(`${datetime} Uncaught Exception1: ${err}`);
  let logFileLocation = "./logs/" + process.pid + "/uncaughtExceptions.log";
  fs.appendFileSync(
    logFileLocation,
    `${datetime} ${process.pid} Uncaught Exception1: ${err}\n`
  );
  if (err) {
    fs.appendFileSync(
      logFileLocation,
      `${datetime} ${process.pid} Error stack: ${err.stack}\n`
    );
  }
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  var datetime = new Date();
  console.log(
    "Unhandled rejection at " +
      JSON.stringify(promise) +
      `reason: ${reason} ${datetime}`
  );
  let logFileLocation = "./logs/" + process.pid + "/uncaughtExceptions.log";
  fs.appendFileSync(
    logFileLocation,
    `${datetime} ${process.pid} Unhandled rejection at , ${promise}, reason: ${reason}\n`
  );
  process.exit(1);
});

process.on("SIGTERM", (signal) => {
  var datetime = new Date();
  console.log(`${datetime} Process ${process.pid} received a SIGTERM signal`);
  let logFileLocation = "./logs/" + process.pid + "/uncaughtExceptions.log";
  fs.appendFileSync(
    logFileLocation,
    `${datetime} Process ${process.pid} received a SIGTERM signal\n`
  );
  process.exit(0);
});

process.on("SIGINT", (signal) => {
  var datetime = new Date();
  console.log(`${datetime} Process ${process.pid} has been interrupted`);
  let logFileLocation = "./logs/" + process.pid + "/uncaughtExceptions.txt";
  fs.appendFileSync(
    logFileLocation,
    `${datetime} Process ${process.pid} has been interrupted\n`
  );
  process.exit(0);
});
