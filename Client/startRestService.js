/*
 * This file is the main file on client machine. This communicates to server
 * using REST APIs. Detailed documentation is given in ReadMe
 */
var express = require('express'),
  http = require('http'),
  fs = require('fs'),
  AdmZip = require('adm-zip'),
  fstream = require('fstream'),
  mongoDB = require('./mongoDB.js'),
  querystring = require('querystring'),
  path = require('path');
bodyParser = require('body-parser');
multer = require('multer');

var app = express();
var clientID;
var sessionID;
var server = process.argv[2];
var serverPort = process.argv[3];
var clientPort = process.argv[4];
var Clientdata;
var upload = multer({
  dest: './node_modules/'
});

app.set('port', process.env.PORT || clientPort);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//app.use(multer({ dest: './node_modules/'}))

/*
 * REST API
 * GET
 * URL to get tool information.
 */
app.get("/tool/:action/:toolID/:sessionID", function(req, res) {
  var toolID = req.params.toolID;
  var action = req.params.action;
  var session = req.params.sessionID;
  console.log(toolID);
  if (session == sessionID) {
    if (action == "getinfo") {
      mongoDB.getToolMapping(toolID, function(data) {
        console.log(JSON.stringify(data));
        if (data != "nil") {
          var toolToCall = require(data.toolNPM);
          toolToCall.getToolInfo(function(toolInfo) {
            res.contentType('application/json');
            res.status(200).send(JSON.stringify(toolInfo));
          });
        } else {
          res.status(404).send("invalid tool id");
        }
      });
    } else {
      res.status(404).send("invalid action");
    }
  } else {
    res.status(404).send("invalid session");
  }
});

/*
 * REST API
 * POST
 * URL to run tool by using information specified in POST data
 */
app.post("/tool/:action/:toolID/:scanID/:sessionID", function(req, res) {
  var toolID = req.params.toolID;
  var action = req.params.action;
  var scanID = req.params.scanID;
  var session = req.params.sessionID;
  var toolRunInfo = req.body;
  console.log(toolRunInfo);
  if (session == sessionID) {
    if (action == "runtool") {
      mongoDB.getToolMapping(toolID, function(data) {
        console.log(JSON.stringify(data));
        if (data != "nil") {
          var toolToCall = require(data.toolNPM);
          //scanID = scanID + 1;
          toolToCall.runTool(scanID, toolRunInfo, function(reportData) {
            //res.contentType('application/json');
            mongoDB.storeJSONReportInDB(reportData, function(status) {
              if (status == "ok") {
                reportData.clientID = clientID;
                //call reporting on server
                var options = {
                  host: server,
                  port: serverPort,
                  path: '/reportsubmit/',
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json'
                  }
                };
                var request = http.request(options, function(res) {
                  res.setEncoding('utf8');
                  res.on('data', function(chunk) {
                    console.log("server report added: " + chunk);
                  });
                });
                request.write(JSON.stringify(reportData));
                request.on('error', function(e) {
                  console.log(e.message);
                  res.send("error");
                });
                request.end();
              } else {
                console.log("error inserting in db");
                res.status(404).send("error in action");
              }
            });
          });
          res.status(200).send("ok");
        } else {
          res.status(404).send("invalid tool id");
        }
      });
    } else {
      res.status(404).send("invalid action");
    }
  } else {
    res.status(404).send("invalid session");
  }
});

/*
 * REST API
 * POST
 * URL to add and configure new tool on client machine
 */
app.post('/toolconfig/addtool/:toolID/:toolName/:toolNPM/:sessionID', upload.single('module'), function(req, res) {
  var toolID = req.params.toolID;
  var toolName = req.params.toolName;
  var toolNPM = req.params.toolNPM;
  var session = req.params.sessionID;

  if (session == sessionID) {
    var toolData = {
      "toolID": toolID,
      "toolName": toolName,
      "toolNPM": toolNPM
    };
    console.log(JSON.stringify(toolData));

    fs.readFile(req.file.path, function(err, data) {
      var newPath = __dirname + "/" + req.file.originalname;
      fs.writeFile(newPath, data, function(err) {
        if (err) throw err;
        var zip = new AdmZip(newPath);
        zip.extractAllTo( /*target path*/ "./node_modules/", /*overwrite*/ true);
        mongoDB.addToolinfo(toolData, function(status) {
          if (status == "ok") {
            fs.unlink(req.file.path, function(err) {
              if (err) {
                console.log("error removing file");
                res.status(404).send("error in action");
              } else {
                res.status(200).send("done");
              }
            });
          } else {
            console.log("error inserting in db");
            res.status(404).send("error in action");
          }
        }); //mongo close
      });
    });
  } else {
    console.log("invalid session ID");
    res.status(404).send("invalid session ID");
  }
});

/*
 * REST API
 * GET
 * URL to delete tool from client repository
 */
app.get("/toolconfig/deletetool/:toolID/:sessionID", function(req, res) {
  var toolID = req.params.toolID;
  var session = req.params.sessionID;

  if (session == sessionID) {
    mongoDB.deleteToolinfo(toolID, function(status) {
      if (status == "ok") {
        res.status(200).send("done");
      } else {
        console.log("error deleting from db");
        res.status(404).send("error in action");
      }
    }); //mongo close
  } else {
    res.status(404).send("invalid session ID");
  }
});

app.post('/engineconfig/', function(req, res) {
  // Configure engine here.
});

/*
 * Function
 * This function will be called when client starts. This will register its
 * IP, PORT, clientID to server.
 */
function register() {
  var configPath = path.join(path.dirname(fs.realpathSync(__filename)), '/');
  fs.readFile(configPath + 'clientID.txt', 'utf8', function(err, Clientdata) {
    if (err) throw err;
    clientPort = clientPort.replace(/(\r\n|\n|\r)/gm, "");
    Clientdata = Clientdata.replace(/(\r\n|\n|\r)/gm, "");
    clientID = Clientdata;
    var options = {
      host: server,
      port: serverPort,
      path: "/register/" + clientPort + "/" + clientID,
      method: 'GET'
    };
    callback = function(response) {
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function(chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function() {
        console.log(clientID)
        if (clientID == "0") {
          console.log(str);
          var data = JSON.parse(str);
          console.log(data.clientID);

          fs.writeFile(configPath + "clientID.txt", data.clientID, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("New ID updated");
              clientID = data.clientID;
              heartBeat();
            }
          });
        } else {
          heartBeat();
        }
      });
    }
    var request = http.request(options, callback);
    request.on('error', function(e) {
      console.log(e.message);
      console.log("Server is down");
      process.exit(1);
    });
    request.end();
  });
}

/*
 * Funtion
 * This function is hearbeat function of client. It will be called every
 * 10 seconds as soon as client starts. It will send heartbeat signal along
 * with list of installed tools and receive a new sessionID which will be
 * valid till next heartbeat.
 */
function heartBeat() {
  //var request = require('request');
  var resData = {
    "toolList": []
  };
  mongoDB.getAllToolID(function(data) {
    for (var i = 0; i < data.length; i++) {
      resData.toolList.push(data[i].toolID);
    }

    var pathStr = "/heartbeat/" + clientID;
    console.log(resData);
    var data = querystring.stringify(resData);

    var options = {
      host: server,
      port: serverPort,
      path: pathStr,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    };

    var request = http.request(options, function(res) {
      res.setEncoding('utf8');
      var str = '';
      res.on('data', function(chunk) {
        str += chunk;
      });
      res.on('end', function() {
        sessionID = JSON.parse(str).sessionID;
        console.log(sessionID);
      });
    });
    request.write(JSON.stringify(resData));
    request.on('error', function(e) {
      console.log(e.message);
    });
    request.end();
    setTimeout(heartBeat, 10000);
  });
}

register();

http.createServer(app).listen(app.get('port'), function() {
  console.log("listening");
});