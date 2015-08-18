/*
 * This file contains database utilities to communicate with mongodb
 * Mongodb is configured in default mode.
 *
 * every function has closure written.
 */
var mongo = require("mongodb");
var host = "127.0.0.1";
var port = 27017;

/*
 * used by /toolconfig/addtool/:toolID/:toolName/:toolNPM/:sessionID
 */
var addToolinfo = function (toolData, callback) {
    var db = new mongo.Db("secEngineController", new mongo.Server(host, port, {}), {
        safe: true
    });
    db.open(function (error) {
        closeraddToolinfo(toolData, callback, db);
    });
}

var closeraddToolinfo = function (toolData, callback, db) {
    db.collection("toolMapping", function (error, collection) {
        collection.findAndModify({
                "toolID": toolData.toolID
            }, [
                ['_id', 'asc']
            ], {
                $set: {
                    "toolName": toolData.toolName,
                    "toolNPM": toolData.toolNPM
                }
            }, {
                upsert: true
            },
            function (err, inserted) {
                if (err) {
                    console.log("error");
                } else {
                    db.close();
                    callback("ok");
                }
            });
    });
}

/*
 * used by /toolconfig/deletetool/:toolID/:sessionID
 */
var deleteToolinfo = function (toolID, callback) {
    var db = new mongo.Db("secEngineController", new mongo.Server(host, port, {}), {
        safe: true
    });
    db.open(function (error) {
        closerdeleteToolinfo(toolID, callback, db);
    });
}

var closerdeleteToolinfo = function (toolID, callback, db) {
    db.collection("toolMapping", function (error, collection) {
        collection.remove({
            "toolID": toolID
        }, function (err, removed) {
            if (err) {
                console.log("error");
            } else {
                db.close();
                callback("ok");
            }
        });
    });
}

/*
 * used by /tool/:action/:toolID/:sessionID  (getToolInfo)
 *         /tool/:action/:toolID/:scanID/:sessionID  (runTool)
 */
var getToolMapping = function (toolID, callback) {
    var db = new mongo.Db("secEngineController", new mongo.Server(host, port, {}), {
        safe: true
    });
    db.open(function (error) {
        closergetToolMapping(toolID, callback, db);
    });
}

var closergetToolMapping = function (toolID, callback, db) {
    db.collection("toolMapping", function (error, collection) {
        collection.find({
            "toolID": toolID
        }, function (error, cursor) {
            cursor.toArray(function (errorarray, toolNPM) {
                if (toolNPM.length == 0) {
                    callback("nil");
                } else {
                    db.close();
                    callback(toolNPM[0]);
                }

            });
        });
    });
}

/*
 * used by function heartBeat()
 */
var getAllToolID = function (callback) {
    var db = new mongo.Db("secEngineController", new mongo.Server(host, port, {}), {
        safe: true
    });
    db.open(function (error) {
        closergetAllToolID(callback, db);
    });
}

var closergetAllToolID = function (callback, db) {
    db.collection("toolMapping", function (error, collection) {
        collection.find(function (error, cursor) {
            cursor.toArray(function (errorarray, data) {
                db.close();
                callback(data);

            });
        });
    });
}

/*
 * used by /tool/:action/:toolID/:scanID/:sessionID  (runTool)
 */
var storeJSONReportInDB = function (reportObj, callback) {
    var db = new mongo.Db("secEngineController", new mongo.Server(host, port, {}), {
        safe: true
    });
    db.open(function (error) {
        closurestoreJSONReportInDB(reportObj, callback, db);
    });
}

var closurestoreJSONReportInDB = function (reportObj, callback, db) {

    db.collection("toolReporting", function (error, collection) {
        collection.insert(reportObj, function (err, inserted) {
            if (err) {
                console.log("Some error occured in db report entry");
            } else {
                db.close();
                callback("ok");
                console.log("db report Inserted successfully");
            }

        });
    });
}

exports.addToolinfo = addToolinfo;
exports.getToolMapping = getToolMapping;
exports.getAllToolID = getAllToolID;
exports.storeJSONReportInDB = storeJSONReportInDB;
exports.deleteToolinfo = deleteToolinfo;
