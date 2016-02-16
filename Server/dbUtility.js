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
//var port = mongo.Connection.DEFAULT_PORT;
var dbUse = 0;

/*
 * Used by /register/:clientPort/:clientID
 */
var insertClientIDIntoDB = function(id, clientIP, clientPort, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureinsertClientIDIntoDB(id, clientIP, clientPort, callback, db);
  });
}

var closureinsertClientIDIntoDB = function(id, clientIP, clientPort, callback, db) {
  db.collection("idCollection", function(error, collection) {
    collection.findAndModify({
        "clientID": id
      }, [
        ['_id', 'asc']
      ], {
        $set: {
          "clientIP": clientIP,
          "clientPort": clientPort
        }
      }, {
        upsert: true
      },
      function(err, inserted) {
        if (err) {
          db.close();
          console.log("Some error occured in client db insertion");
          callback();
        } else {
          console.log("client entered successfully");
          db.close();
          callback();
        }
      });
  });
}

/*
 * Used by /getallclienttools/:clientID
 */
var getClientIds = function(clientID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetClientIds(clientID, callback, db);
  });
}

var closuregetClientIds = function(clientID, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "clientID": clientID
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        db.close();
        callback(data[0].toolList);
      });
    });
  });
}

/*
 * used by /heartbeat/:clientID
 */
var performHeartBeat = function(id, status, currentTime, toolsArray, sessionID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureperformHeartBeat(id, status, currentTime, toolsArray, sessionID, callback, db);
  });
}

var closureperformHeartBeat = function(id, status, currentTime, toolsArray, sessionID, callback, db) {
  var createStatusForClient = {
    "clientID": id,
    "status": status,
    "timestamp": currentTime,
    "toolList": toolsArray,
    "sessionID": sessionID
  };
  db.collection("toolsCollection", function(error, collection) {
    collection.insert(createStatusForClient, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured in 1st heartbeat");
        callback(false);
      } else {
        db.close();
        callback(true);
        console.log("Client heart beat Inserted successfully");
      }
    });
  });
}

/*
 * used by /heartbeat/:clientID
 */
var getclientStatusData = function(id, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetclientStatusData(id, callback, db);
  });
}

var closuregetclientStatusData = function(id, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "clientID": id
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(true);
        }
      });
    });
  });
}

/*
 * used by /getactiveclient/:clientID
 */
var getclientActiveStatus = function(id, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetclientActiveStatus(id, callback, db);
  });
}

var closuregetclientActiveStatus = function(id, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "clientID": id.toString(),
      "status": "Active"
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(true);
        }
      });
    });
  });
}

/*
 * used by /heartbeat/:clientID
 */
var updateHeartBeatStatus = function(id, status, currentTime, toolsArray, sessionID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureupdateHeartBeatStatus(id, status, currentTime, toolsArray, sessionID, callback, db);
  });
}

var closureupdateHeartBeatStatus = function(id, status, currentTime, toolsArray, sessionID, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.update({
      "clientID": id
    }, {
      $set: {
        "status": status,
        "timestamp": currentTime,
        "toolList": toolsArray,
        "sessionID": sessionID
      }
    }, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured");
        callback(false);
      } else {
        db.close();
        callback(true);
      }
    });
  });
}

/*
 * used by /admin/deleteservertool/:toolID
 *         /gettoolinfoserver/:toolID
 *         /admin/pushtoolclient/
 */
var getToolData = function(id, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closergetToolData(id, callback, db);
  });
}

var closergetToolData = function(id, callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.find({
      "toolID": id
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        db.close();
        callback(data[0]);
      });
    });
  });
}

/*
 * used by /getclientidfortoolid/:toolID
 */
var getClinetIDForTool = function(id, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closergetClinetIDForTool(id, callback, db);
  });
}

var closergetClinetIDForTool = function(id, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "toolList": id
    }, {
      "clientID": 1
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        db.close();
        callback(data);
      });
    });
  });
}

/*
 * used by /gettoolinfo/:clientID/:toolID
 *         /deleteclienttool/:clientID/:toolID
 *         /runtool/:clientID/:toolID
 *         /admin/pushtoolclient/
 */
var getClientData = function(id, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closergetClientData(id, callback, db);
  });
}

var closergetClientData = function(id, callback, db) {
  db.collection("idCollection", function(error, collection) {
    collection.find({
      "clientID": id
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        db.close();
        callback(data[0]);
      });
    });
  });
}

/*
 * used by /reportsubmit/
 */
var storeJSONReportInDB = function(reportObj, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closurestoreJSONReportInDB(reportObj, callback, db);
  });
}
var closurestoreJSONReportInDB = function(reportObj, callback, db) {
  db.collection("toolReporting", function(error, collection) {
    collection.findAndModify({
        "scanID": reportObj.scanID
      },
      //    sort:{ /* second arg */
      [
        ['_id', 'asc']
      ],
      //    },
      //      update: { /* third arg */ 
      {
        $set: {
          "toolName": reportObj.toolNPM,
          "toolNPM": reportObj.toolNPM,
          "data": [{
            "input": reportObj.data[0].input,
            "output": reportObj.data[0].output,
            "message": reportObj.data[0].message
          }],
          "clientID": reportObj.clientID
        }
      },
      /* fourth arg */ //
      {
        upsert: true
      },
      function(err, inserted) {
        if (err) {
          db.close();
          console.log("Some error occured in client db insertion");
          callback();
        } else {
          console.log("client entered successfully");
          db.close();
          callback("ok");
        }
      });
  });
}

/*
 * used by /authenticate/
 */
var getpasswordHash = function(username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetpasswordHash(username, callback, db);
  });
}

var closuregetpasswordHash = function(username, callback, db) {
  db.collection("credentials", function(error, collection) {
    collection.find({
      "username": username
    }, function(error, cursor) {
	if (error) {
          db.close();
          callback("error");
        }
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
           data = "error";
          db.close();
          callback("error");
        } else {
          db.close();
          callback(data[0].password);
        }
      });
    });
  });
}

/*
 * used by /getclients/:username
 */
var getUserClientMapping = function(username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetUserClientMapping(username, callback, db);
  });
}

var closuregetUserClientMapping = function(username, callback, db) {
  db.collection("userClientMapping", function(error, collection) {
    collection.find({
      "username": username
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback({
            "clientID": data[0].clientID
          });
        }
      });
    });
  });
}

/*
 * used by /admin/uploadtoolserver/:toolID/:toolName/:toolNPM
 */
var addToolInfo = function(toolData, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureaddToolInfo(toolData, callback, db);
  });
}

var closureaddToolInfo = function(toolData, callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.findAndModify({
        "toolID": toolData.toolID
      }, [
        ['_id', 'asc']
      ], {
        $set: {
          "toolName": toolData.toolName,
          "toolNPM": toolData.toolNPM,
          "version": toolData.version
        }
      }, {
        upsert: true
      },
      function(err, inserted) {
        if (err) {
          db.close();
          console.log("Some error occured in db tool entry");
          callback("error");
        } else {
          db.close();
          console.log("db tool Inserted successfully");
          callback("ok");
        }
      });
  });
}

/*
 * used by downloadAndUpdate function
 */
var updateToolVersion = function(toolData, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureupdateToolVersion(toolData, callback, db);
  });
}

var closureupdateToolVersion = function(toolData, callback, db) {
  db.collection("toolData", function(error, collection) {
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
          console.log("Some error occured in db tool entry");
          callback("error");
        } else {
          db.close();
          console.log("db tool Inserted successfully");
          callback("ok");
        }

      });
  });
}

/*
 * used by /admin/userclientmap/
 */
var addClientUserMapping = function(userName, clientID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureaddClientUserMapping(userName, clientID, callback, db);
  });
}

var closureaddClientUserMapping = function(userName, clientID, callback, db) {
  console.log(userName);
  console.log(clientID);
  db.collection("userClientMapping", function(error, collection) {
    collection.findAndModify({
        "username": userName
      }, [
        ['_id', 'asc']
      ], {
        $set: {
          "clientID": clientID
        }
      }, {
        upsert: true
      },
      function(err, inserted) {
        if (err) {
          console.log("Some error occured in client db insertion");
          db.close();
          callback("error");
        } else {
          console.log("mapping entered successfully");
          db.close();
          callback("ok");
        }
      });
  });
}

/*
 * used by /admin/adduser/
 */
var addUserInDB = function(userData, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureaddUserInDB(userData, callback, db);
  });
}

var closureaddUserInDB = function(userData, callback, db) {
  db.collection("credentials", function(error, collection) {
    collection.insert(userData, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured in db report entry");
        callback("error");
      } else {
        db.close();
        console.log("db report Inserted successfully");
        callback("ok");
      }
    });
  });
}

/*
 * used by /getemail/:username
 */
var getEmail = function(username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetEmail(username, callback, db);
  });
}

var closuregetEmail = function(username, callback, db) {
  db.collection("credentials", function(error, collection) {
    collection.find({
      "username": username
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data[0].email);
        }
      });
    });
  });
}

/*
 * used by /getallusers
 */
var getUsers = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetUsers(callback, db);
  });
}

var closuregetUsers = function(callback, db) {
  db.collection("credentials", function(error, collection) {
    collection.find(function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data);
        }
      });
    });
  });
}

/*
 * used by /admin/getallservertoolinfo/
 */
var getAllTools = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAllTools(callback, db);
  });
}

var closuregetAllTools = function(callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.find(function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        var toolData = [];
        for (var i = 0; i < data.length; i++) {
          toolData.push({
            "toolID": data[i].toolID,
            "toolName": data[i].toolName,
            "toolNPM": data[i].toolNPM
          });
        }
        if (error) {
          db.close();
          callback("error");
        } else {
          db.close();
          callback(toolData);
        }
      });
    });
  });
}

/*
 * used by updateServerDrivers function
 */
var getAllToolsVersion = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAllToolsVersion(callback, db);
  });
}

var closuregetAllToolsVersion = function(callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.find(function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        var toolData = [];
        for (var i = 0; i < data.length; i++) {
          toolData.push({
            "toolID": data[i].toolID,
            "version": data[i].version
          });
        }
        if (error) {
          db.close();
          callback("error");
        } else {
          db.close();
          callback(toolData);
        }
      });
    });
  });
}

/*
 * used by /admin/getallclients/
 */
var getAllActiveClients = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAllActiveClients(callback, db);
  });
}

var closuregetAllActiveClients = function(callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "status": "Active"
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        var clientData = [];
        for (var i = 0; i < data.length; i++) {
          clientData.push(data[i].clientID);
        }
        if (error) {
          db.close();
          callback("error");
        } else {
          db.close();
          callback(clientData);
        }
      });
    });
  });
}

/*
 * used by /admin/deleteservertool/:toolID
 */
var removeToolData = function(toolID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureremoveToolData(toolID, callback, db);
  });
}

var closureremoveToolData = function(toolID, callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.remove({
      "toolID": toolID
    }, function(error, removed) {
      if (error) {
        db.close();
        callback("error");
      } else {
        db.close();
        callback("ok");
      }
    });
  });
}

/*
 * used by function changeClientStatus()
 */
var getAllActiveClientTime = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAllActiveClientTime(callback, db);
  });
}

var closuregetAllActiveClientTime = function(callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "status": "Active"
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        var clientData = [];
        for (var i = 0; i < data.length; i++) {
          clientData.push({
            "clientID": data[i].clientID,
            "timestamp": data[i].timestamp
          });
        }
        if (error) {
          db.close();
          callback("error");
        } else {
          db.close();
          callback(clientData);
        }
      });
    });
  });
}

/*
 * used by function changeClientStatus()
 */
var updateClientStatus = function(id, status, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureupdateClientStatus(id, status, callback, db);
  });
}

var closureupdateClientStatus = function(id, status, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.update({
      "clientID": id
    }, {
      $set: {
        "status": status
      }
    }, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured");
        callback("error");
      } else {
        db.close();
        callback("ok");
      }
    });
  });
}

/*
 * used by /gettoolinfo/:clientID/:toolID
 *         /deleteclienttool/:clientID/:toolID
 *         /runtool/:clientID/:toolID
 *         /admin/pushtoolclient/
 *
 */
var getClientSessionID = function(clientID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetClientSessionID(clientID, callback, db);
  });
}

var closuregetClientSessionID = function(clientID, callback, db) {
  db.collection("toolsCollection", function(error, collection) {
    collection.find({
      "clientID": clientID
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data[0].sessionID);
        }
      });
    });
  });
}

/*
 * used by /getreport/:username/:scanID
 */
var getReport = function(username, scanID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetReport(username, scanID, callback, db);
  });
}

var closuregetReport = function(username, scanID, callback, db) {
  console.log(scanID);
  db.collection("toolReporting", function(error, collection) {
    collection.find({
      "user": username,
      "scanID": scanID
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data[0]);
        }
      });
    });
  });
}

/*
 * used by function restoreLastValues()
 */
var getLastScanId = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetLastScanId(callback, db);
  });
}

var closuregetLastScanId = function(callback, db) {
  db.collection("lastValue", function(error, collection) {
    collection.find({
      "key": "scanID"
    }, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data[0]);
        }
      });
    });
  });
}

/*
 * used by /runtool/:clientID/:toolID
 */
var updateLastScanId = function(scanID, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureupdateLastScanId(scanID, callback, db);
  });
}

var closureupdateLastScanId = function(scanID, callback, db) {
  db.collection("lastValue", function(error, collection) {
    collection.update({
      "key": "scanID"
    }, {
      $set: {
        "value": scanID
      }
    }, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured");
        callback("error");
      } else {
        db.close();
        callback("ok");
      }
    });;
  });
}

/*
 * used by /getattacklist/
 */
var getAttackList = function(callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetAttackList(callback, db);
  });
}

var closuregetAttackList = function(callback, db) {
  db.collection("toolData", function(error, collection) {
    collection.find({}, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(data);
        }
      });
    });
  });
}

/*
 * used by /adduser/
 */
var isUser = function(username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureisUser(username, callback, db);
  });
}

var closureisUser = function(username, callback, db) {
  db.collection("credentials", function(error, collection) {
    collection.find({"username":username}, function(error, cursor) {
      cursor.toArray(function(errorarray, data) {
        if (data[0] == undefined) {
          db.close();
          callback(false);
        } else {
          db.close();
          callback(true);
        }
      });
    });
  });
}

var getallsummary = function(username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closuregetallsummary(username, callback, db);
  });
}

var closuregetallsummary = function(username, callback, db) {
  db.collection("toolReporting", function(error, collection) {
    if (username == "admin") {
      collection.find(function(error, cursor) {
        cursor.toArray(function(errorarray, CBdata) {
          var summaryData = [];
          for (var i = 0; i < CBdata.length; i++) {
            summaryData.push({
              "SrNo": i + 1,
              "scanID": CBdata[i].scanID,
              "toolName": CBdata[i].toolNPM,
              "target": CBdata[i].data[0].input,
              "date": CBdata[i].date
            });
          }
          if (error) {
            db.close();
            callback("error");
          } else {
            db.close();
            callback(summaryData);
          }
        });
      });
    } else {
      collection.find({
        "user": username
      }, function(error, cursor) {
        cursor.toArray(function(errorarray, CBdata) {
          var summaryData = [];
          for (var i = 0; i < CBdata.length; i++) {
            summaryData.push({
              "SrNo": i + 1,
              "scanID": CBdata[i].scanID,
              "toolName": CBdata[i].toolNPM,
              "target": CBdata[i].data[0].input,
              "date": CBdata[i].date
            });
          }
          if (error) {
            db.close();
            callback("error");
          } else {
            db.close();
            callback(summaryData);
          }
        });
      });
    }
  });
}

/*
 * used by /insertscanID/:scanID/:username 
 */
var insertscanID = function(scanID, username, callback) {
  var db = new mongo.Db("secToolController", new mongo.Server(host, port, {}), {
    safe: true
  });
  db.open(function(error) {
    closureinsertscanID(scanID, username, callback, db);
  });
}

var closureinsertscanID = function(scanID, username, callback, db) {
  var currDate = Date();
  var ID = scanID.toString();
  var reportData = {
    "scanID": ID,
    "toolNPM": 'Dummy',
    "toolName": 'Dummy',
    "user": username,
    "date": currDate,
    "data": [{
      "input": 'Dummy',
      "output": 'Dummy',
      "message": 'Dummy'
    }],
    "clientID": 'Dummy'
  };
  db.collection("toolReporting", function(error, collection) {
    collection.insert(reportData, function(err, inserted) {
      if (err) {
        db.close();
        console.log("Some error occured ");
        callback(false);
      } else {
        db.close();
        callback(true);
        console.log("Report Initial data Inserted successfully");
      }
    });
  });
}

exports.performHeartBeat = performHeartBeat;
exports.insertClientIDIntoDB = insertClientIDIntoDB;
exports.getclientStatusData = getclientStatusData;
exports.updateHeartBeatStatus = updateHeartBeatStatus;
exports.getToolData = getToolData;
exports.getClientData = getClientData;
exports.storeJSONReportInDB = storeJSONReportInDB;
exports.getpasswordHash = getpasswordHash;
exports.getUserClientMapping = getUserClientMapping;
exports.addToolInfo = addToolInfo;
exports.addClientUserMapping = addClientUserMapping;
exports.addUserInDB = addUserInDB;
exports.getClientIds = getClientIds;
exports.getEmail = getEmail;
exports.getAllTools = getAllTools;
exports.getAllActiveClients = getAllActiveClients;
exports.removeToolData = removeToolData;
exports.getAllActiveClientTime = getAllActiveClientTime;
exports.updateClientStatus = updateClientStatus;
exports.getClientSessionID = getClientSessionID;
exports.getclientActiveStatus = getclientActiveStatus;
exports.getReport = getReport;
exports.getLastScanId = getLastScanId;
exports.updateLastScanId = updateLastScanId;
exports.getAttackList = getAttackList;
exports.getClinetIDForTool = getClinetIDForTool;
exports.getUsers = getUsers;
exports.getAllToolsVersion = getAllToolsVersion;
exports.updateToolVersion = updateToolVersion;
exports.isUser = isUser;
exports.getallsummary = getallsummary;
exports.insertscanID = insertscanID;
