"use strict";
const _ = require("underscore");
const sql = require("mssql");
const util = require("util");
const dbConn = require("../dao/initConnection.js");
const log = require("../logger/loggerService.js");

/**
  create table NodeSession
   (
      sessionId nvarchar(450) not null primary key,
      sessionData nvarchar(max) null,
      lastTouchedUtc datetime not null
    )

 */

module.exports = function (session) {
  var Store = session.Store;

  function MssqlStore(options) {
    var self = this;

    options = options || {};
    Store.call(self, options);

    if (
      !_.isUndefined(options.connection) &&
      !(options.connection instanceof sql.ConnectionPool)
    ) {
      throw new Error(
        "If defined, options.connection must be instance of mssql.ConnectionPool."
      );
    }
    if (!_.isUndefined(options.ttl) && !_.isNumber(options.ttl)) {
      throw new Error("If defined, options.ttl must be an instance of Number.");
    } else if (options.ttl <= 0) {
      throw new Error("If defined, options.ttl must be > 0.");
    }
    if (
      !_.isUndefined(options.reapInterval) &&
      !_.isNumber(options.reapInterval)
    ) {
      throw new Error(
        "If defined, options.reapInterval must be an instance of Number."
      );
    } else if (options.reapInterval === 0 || options.reapInterval < -1) {
      throw new Error(
        "If defined, options.reapInterval must a positive number or -1 to indicate no reaping."
      );
    }
    if (
      !_.isUndefined(options.reapCallback) &&
      !_.isFunction(options.reapCallback)
    ) {
      throw new Error("If defined, options.reapCallback must be a function.");
    }

    self.options = {
      connection: options.connection,
      ttl: options.ttl || 3600,
      reapInterval: options.reapInterval || 3600,
      reapCallback: options.reapCallback || _.noop
    };

    if (self.options.reapInterval !== -1) {
      self.reap();
      setInterval(self.reap.bind(self), self.options.reapInterval * 1000);
    }
  }

  util.inherits(MssqlStore, Store);

  MssqlStore.prototype.reap = function () {
    var self = this;

    dbConn
      .poolConnect()
      .then((res) => {
        var request = self.options.connection.request();
        request.input("ttl", sql.Int, self.options.ttl);
        request.query(
          "delete [NodeSession] where lastTouchedUtc <= dateadd(second, -1 * @ttl, getutcdate());",
          self.options.reapCallback
        );
      })
      .catch((err) => {
        log.logCompleteError("Reap Error", err);
      });
  };

  MssqlStore.prototype.get = function (sessionId, callback) {
    var self = this;
    var stmt =
      "select sessionData from [NodeSession] where sessionId = @sessionId;";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = self.options.connection.request();
        request.input("sessionId", sql.NVarChar(450), sessionId);
        request.query(stmt, function (err, recordset) {
          if (err) return callback(err);
          if (recordset) {
            var session = null;
            try {
              if (
                recordset.recordset[0] &&
                recordset.recordset[0].sessionData
              ) {
                var data = recordset.recordset[0].sessionData;
                session = JSON.parse(data);
              }
            } catch (err) {
              return callback(err);
            }
            self.touch(sessionId, session, function (err) {
              callback(err, session);
            });
          } else {
            callback();
          }
        });
      })
      .catch((err) => {
        log.logCompleteError("Get Error", err);
      });
  };

  MssqlStore.prototype.set = function (sessionId, session, callback) {
    var self = this;
    var stmt =
      "if exists(select sessionId from [NodeSession] where sessionId = @sessionId)\
                  begin\
                    update [NodeSession] set sessionData = @sessionData where sessionId = @sessionId;\
                  end\
                  else\
                  begin\
                    insert into [NodeSession] (sessionId, sessionData, lastTouchedUtc) values(@sessionId, @sessionData, getutcdate());\
                  end";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = self.options.connection.request();
        request.input("sessionId", sql.NVarChar(450), sessionId);
        request.input(
          "sessionData",
          sql.NVarChar(sql.MAX),
          JSON.stringify(session)
        );
        request.query(stmt, callback);
      })
      .catch((err) => {
        log.logCompleteError("Set Error", err);
      });
  };

  MssqlStore.prototype.destroy = function (sessionId, callback) {
    var stmt = "delete [NodeSession] where sessionId = @sessionId";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = this.options.connection.request();
        request.input("sessionId", sql.NVarChar(450), sessionId);
        request.query(stmt, callback);
      })
      .catch((err) => {
        log.logCompleteError("Destroy Error", err);
      });
  };

  MssqlStore.prototype.touch = function (sessionId, session, callback) {
    var stmt =
      "update [NodeSession] set lastTouchedUtc = getutcdate() where sessionId = @sessionId";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = this.options.connection.request();
        request.input("sessionId", sql.NVarChar(450), sessionId);
        request.query(stmt, callback);
        return this;
      })
      .catch((err) => {
        log.logCompleteError("Touch Error", err);
      });
  };

  MssqlStore.prototype.length = function (callback) {
    var stmt = "select count(*) from [NodeSession]";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = this.options.connection.request();
        request.query(stmt, function (err, recordset) {
          if (err) return callback(err);
          var length = recordset.recordset[0][""] || 0;
          callback(null, length);
        });
      })
      .catch((err) => {
        log.logCompleteError("Length Error", err);
      });
  };

  MssqlStore.prototype.clear = function (callback) {
    var stmt = "delete [NodeSession]";

    dbConn
      .poolConnect()
      .then((res) => {
        var request = this.options.connection.request();
        request.query(stmt, callback);
      })
      .catch((err) => {
        log.logCompleteError("Clear Error", err);
      });
  };

  return MssqlStore;
};
