/*
 * This file contains database utilities to communicate with mongodb
 * Mongodb is configured in default mode.
 *
 * every function has closure written.
 */
var mongo = require("mongodb");
var config = require("./config.json");
var host = config.mongoIP;
var port = config.mongoPort;

/*
 * used by /uploadtool
 */
var updateToolInDB = function(toolData, callback) {
  var db = new mongo.Db("updateServer", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureupdateToolInDB(toolData, callback, db);
  });
}

var closureupdateToolInDB = function(toolData, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.findAndModify({
        "toolID": toolData.toolID
      }, [
        ['_id', 'asc']
      ], {
        $set: {
          "version": toolData.version
        }
      }, {
        upsert: true
      },
      function(err, inserted) {
        if (err) {
          db.close();
          console.log("Some error occured in updating tool in DB");
          callback("error");
        } else {
          db.close();
          console.log("Tool updated successfully");
          callback("ok");
        }
      });
  });
}

/*
 * used by /getallversion 
 */
var getAllVersion = function(callback) {
  var db = new mongo.Db("updateServer", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAllVersion(callback, db);
  });
}

var closuregetAllVersion = function(callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find(function(errArr, cursor) {
      if (errArr) {
        db.close();
        console.log("no data found in DB");
        callback(toolID, "error");
      } else {
        cursor.toArray(function(errCur, data) {
          db.close();
          //console.log(data);
          if (data.length == 0) {
            callback('error');
          } else {
            callback(data);
          }
        });
      }
    });
  });
}

exports.updateToolInDB = updateToolInDB;
exports.getAllVersion = getAllVersion;
