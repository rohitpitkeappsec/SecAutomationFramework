/*
 * This is main server file. Containing all the external as well as
 * Client-server communication APIs.
 * Detailed documentation of each REST API is given in ReadMe
 */
var FormData = require('form-data');
var fs = require('fs');
var path = require('path');
var http = require('http');
var express = require('express');
var Admzip = require('adm-zip');
var bodyParser = require('body-parser');
var db = require('./dbUtility.js');
var config = require('./config.json');
var multer = require('multer');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var validator = require('validator');
var upload = multer({
  dest: './tools/'
});

var scanID = 0;
var updateServerInfo = '';
var app = express();
console.log(config.port);

app.set('port', config.port);
//app.use(bodyParser());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
//app.use(multer({ dest: './tools/'}))

app.use(session({
  secret: 'gfty656rur67rbui7rcerwyi7',
  httpOnly: true,
  saveUninitialized: true,
  resave: true
}));
var apiRoutes = express.Router();
app.set('superSecret', "everythingisFragile");

/*
 * REST API
 * POST
 * Heartbeat signal sent by client every 30 seconds.
 */
app.post("/heartbeat/:clientID", function(req, res) {
  var clientID = req.params.clientID;
  var toolList = req.body.toolList;
  var sessionID = Math.floor((Math.random() * 10000) + 1);
  var status = "Active";
  console.log(toolList);
  console.log(clientID);
  var currentTime = new Date().getTime();
  var callback = function(status) {
    if (status == true) {
      res.send({
        "status": "Success",
        "sessionID": sessionID
      });
    } else {
      res.send({
        "status": "Invalid"
      });
    }
  }
  db.getclientStatusData(clientID, function(clientStatus) {
    console.log(clientStatus);
    if (clientStatus == true) {
      db.updateHeartBeatStatus(clientID, status, currentTime, toolList, sessionID, callback);
    } else {
      db.performHeartBeat(clientID, status, currentTime, toolList, sessionID, callback);
    }
  });
});

/*
 * REST API
 * POST
 * Authenticate user
 */

app.post('/authenticate', function(req, res) {
  authData = req.body;
  for (var key in req.body)
    console.log(req.body[key] + ":" + key);
  userName = authData.userName;
  password = authData.password;
  //console.log(userName + ":" + password);

  db.isValidCredential(userName, password, function(status) {
    if (status == true) {
      var token = jwt.sign(userName, app.get('superSecret'), {
        expiresInMinutes: 1440 // expires in 24 hours
      });
      res.send({
        "status": "Success",
        "token": token
      });
    } else {
      res.send({
        "status": "Invalid"
      });
    }
  });
});

/*
 * REST API
 * POST
 * URL to submit report from client
 * Report is in json format in POST body
 */
app.post('/reportsubmit/', function(req, res) {
  var reportData = req.body;
  console.log(reportData);
  db.storeJSONReportInDB(reportData, function(status) {
    if (status == "ok") {
      console.log("Db entered: " + reportData);
      res.send("ok");
    } else {
      console.log("error inserting in db");
      res.status(404).send("error in action");
    }
  });
});

/*
 * REST API
 * GET
 * URL to register client to server
 */
app.get("/register/:clientPort/:clientID", function(req, res) {
  var clientPort = req.params.clientPort;
  var clientID = req.params.clientID;
  var clientIP = req.connection.remoteAddress;
  var id;
  if (clientID == "0") {
    id = Math.floor((Math.random() * 1000) + 1);
  } else {
    id = clientID;
  }
  console.log(id);
  id = id.toString();
  db.insertClientIDIntoDB(id, clientIP, clientPort, function() {
    res.json({
      "clientID": id
    });
  });
});

apiRoutes.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});
//app.use(apiRoutes);

/*
 * REST API
 * GET
 * URL to retrieve tool information on specified client ID
 */

app.get('/gettoolinfo/:clientID/:toolID', function(req, res) {
  var clientID = req.params.clientID;
  var toolID = req.params.toolID;
  db.getClientSessionID(clientID, function(sessionID) {
    db.getClientData(clientID, function(clientData) {
      var options = {
        host: clientData.clientIP,
        port: clientData.clientPort,
        path: "/tool/getinfo/" + toolID + "/" + sessionID,
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
          console.log(str);
          res.send(str);
        });
      }
      var request = http.request(options, callback);
      request.on('error', function(e) {
        console.log(e.message);
        res.send("error");
      });
      request.end();
    });
  });
});

/*
 * REST API
 * GET
 * URL to delete specified tool on specified client.
 */
app.get('/deleteclienttool/:clientID/:toolID', function(req, res) {
  var clientID = req.params.clientID;
  var toolID = req.params.toolID;
  db.getClientSessionID(clientID, function(sessionID) {
    db.getClientData(clientID, function(clientData) {
      var options = {
        host: clientData.clientIP,
        port: clientData.clientPort,
        path: "/toolconfig/deletetool/" + toolID + "/" + sessionID,
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
          console.log(str);
          if (str == "done") {
            res.send({
              "status": "Success"
            });
          } else {
            res.status(404).send({
              "status": "Fail"
            });
          }
        });
      }
      var request = http.request(options, callback);
      request.on('error', function(e) {
        console.log(e.message);
        res.status(404).send({
          "status": "Fail"
        });
      });
      request.end();
    });
  });
});

/*
 * REST API
 * POST
 * URL to run tool on specific client.
 * Data to run tool is in json format in post body.
 */
app.post('/runtool/:clientID/:toolID', function(req, res) {
  var clientID = req.params.clientID;
  var toolID = req.params.toolID;
  var runInfo = req.body;
  scanID = parseInt(scanID) + 1;
  console.log(runInfo);
  db.getClientSessionID(clientID, function(sessionID) {
    db.getClientData(clientID, function(clientData) {
      var options = {
        host: clientData.clientIP,
        port: clientData.clientPort,
        path: '/tool/runtool/' + toolID + '/' + scanID + '/' + sessionID,
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      };
      var request = http.request(options, function(runRes) {
        runRes.setEncoding('utf8');
        runRes.on('data', function(runStatus) {
          db.updateLastScanId(scanID, function(updateStatus) {
            if (updateStatus == "ok") {
              if (runStatus == "ok") {
                res.send({
                  "scanID": scanID
                });
              } else {
                res.status(404).send("error in action");
              }
            } else {
              console.log("error updating scanID last value");
              res.status(404).send("error updating scanID last value");
            }
          });
        });
      });
      request.write(JSON.stringify(runInfo));
      request.on('error', function(e) {
        console.log(e.message);
        res.send("error");
      });
      request.end();
    });
  });
});

/*
 * REST API
 * POST
 * URL to push the tool to client machine.
 */
app.post('/admin/pushtoolclient/', function(req, res) {
  var nodeData = req.body;
  var clientID = nodeData.clientID;
  console.log(nodeData);
  db.getClientSessionID(clientID, function(sessionID) {
    db.getToolData(nodeData.toolID, function(data) {
      db.getClientData(clientID, function(clientData) {
        var addToolpath = '/toolconfig/addtool/' + nodeData.toolID + '/' + data.toolName + '/' + data.toolNPM + '/' + sessionID;
        console.log(addToolpath);
        var form = new FormData();
        fs.exists('./tools/' + data.toolNPM + '.zip', function(exists) {
          if (exists) {
            form.append('my_field', 'my value');
            form.append('my_buffer', new Buffer(10));
            form.append('module', fs.createReadStream('./tools/' + data.toolNPM + '.zip'));
            var request = http.request({
              method: 'POST',
              host: clientData.clientIP,
              port: clientData.clientPort,
              path: addToolpath,
              headers: form.getHeaders()
            });

            form.pipe(request);

            request.on('response', function(resEngine) {
              console.log(resEngine.statusCode);
              if (resEngine.statusCode == "200") {
                res.status(200).send({
                  "status": "Success"
                });
              } else {
                res.status(404).send({
                  "status": "Fail"
                });
              }
            });

            request.on('error', function(e) {
              console.log(e.message);
              res.send("error");
            });
          } else {
            console.log('./tools/' + data.toolNPM + '.zip not found');
            res.status(404).send({
              "status": "Fail"
            });
          }
        });
      });
    });
  });
});

/*
 * REST API
 * GET
 * Get associated clients to user
 */
app.get('/getclients/:username', function(req, res) {
  console.log(req.sessionID);
  userName = req.params.username;
  db.getUserClientMapping(userName, function(status) {
    if (status == false) {
      res.send("No clients");
    } else {
      res.send(status);
    }
  });
});

/*
 * REST API
 * GET
 * Get status of the client
 */
app.get('/getactiveclient/:clientID', function(req, res) {
  clientID = req.params.clientID;
  db.getclientActiveStatus(clientID, function(status) {
    if (status == true) {
      res.send({
        "status": "Active"
      });
    } else {
      res.send({
        "status": "Inactive"
      });
    }
  });
});

/*
 * REST API
 * POST
 * URL to upload plugin to server.
 */
app.post('/admin/uploadtoolserver/', upload.single('filename'), function(req, res) {
  if (req.file.filename.originalname == '') {
    console.log("No ZIP to upload");
    res.status(404).send({
      "status": "Fail"
    });
  } else {
    fs.readFile(req.file.path, function(err, data) {
      if (err) throw err;

      var filename = req.file.originalname.split("/");
      var newPath = __dirname + "/tools/" + filename[filename.length - 1];

      var toolname = filename[filename.length - 1].split(".")[0];
      var toolfolder = toolname + "/";
      var destfolder = __dirname + "/tools/" + toolname + "/";
      var packageFile = toolname + "/package.json";

      var toolData = {
        "toolID": toolname,
        "toolName": toolname,
        "toolNPM": toolname,
        "version": ''
      };
      fs.writeFile(newPath, data, function(err) { // create zip file in local folder
        if (err) throw err;
        try { // this should be outside all processing
          var zip = new Admzip(newPath);

          var toolfolderinZip = zip.getEntry(toolfolder);
          var zipFiles = zip.getEntries();
          var isDriverFile = false;
          var isParserFile = false;
          var isPackageFile = false;
          var isRunDataFile = false;

          for (var i = 0; i < zipFiles.length; i++) {
            if (zipFiles[i].entryName == toolname + "/" + toolname + ".json") {
              isRunDataFile = true;
            } else if (zipFiles[i].entryName == toolname + "/" + toolname + ".js") {
              isDriverFile = true;
            } else if (zipFiles[i].entryName == toolname + "/package.json") {
              isPackageFile = true;
            } else if (zipFiles[i].entryName == toolname + "/" + toolname + "Parser.js") {
              isParserFile = true;
            }
          }
          //console.log(JSON.stringify(zip.getEntries()));
          // console.log("tool files folder: " + toolfolderinZip );

          if (toolfolderinZip != null && isDriverFile && isParserFile && isPackageFile && isRunDataFile) {

            // process the files by extracting the files and making DB entry

            packageFile = destfolder + "package.json";
            zip.extractAllTo( /*target path*/ "./tools/", /*overwrite*/ true);
            fs.readFile(packageFile, 'utf8', function(err, data) {
              packageJSONData = JSON.parse(data);
              console.log(packageJSONData.version);
              toolData.version = packageJSONData.version;
              db.addToolInfo(toolData, function(status) {
                fs.unlink(req.file.path, function(err) {
                  if (err) {
                    console.log("error removing file : $newPath");
                  }
                });

                if (status == "ok") {
                  res.status(200).send({
                    "status": "Success"
                  });
                } else { // adding tool info to DB failed
                  console.log("error inserting in db");
                  res.status(404).send({
                    "status": "Fail"
                  });
                } // inner else
              }); // db.addToolInfo
            }); // fs.readFile of package file
          } else { // IF for folder check in zip
            console.log("### Necessary files not present in the zip... Failed");
            console.log("error extracting file : " + newPath);
            fs.unlink(req.file.path, function(err) {
              if (err) {
                console.log("error removing file : $newPath");
              }
            });
            fs.unlink(newPath, function(err) {
              if (err) {
                console.log("error removing file : $newPath");
              }
            });
            res.status(404).send({
              "status": "Fail"
            });
          } // else
        } catch (ex) {
          fs.unlink(req.file.path, function(err) {
            if (err) {
              console.log("error removing file : $newPath");
            }
          });
          fs.unlink(newPath, function(err) {
            if (err) {
              console.log("error removing file : $newPath");
            }
          });
          res.status(404).send({
            "status": "Fail"
          });
        } // catch
      }); //writeFile
    }); // readFile
  } // outer else
}); // API end

/*
 * REST API
 * POST
 * Map users with available clients
 */
app.post('/admin/userclientmap/', function(req, res) {
  userName = req.body.username;
  clientID = req.body.clientID;
  if (userName == '') {
    console.log("Username Missing");
    res.status(404).send({
      "status": "Fail"
    });
  } else if (clientID == '') {
    console.log("clientID Missing");
    res.status(404).send({
      "status": "Fail"
    });
  } else {
    var duplicate = false;
    for (var i = 0; i < clientID.length - 1; i++) {
      for (var j = i + 1; j < clientID.length; j++) {
        if (clientID[i] == clientID[j]) {
          duplicate = true;
        }
      }
    }
    if (duplicate == false) {
      db.addClientUserMapping(userName, clientID, function(status) {
        if (status == "ok") {
          console.log("Db entered");
          res.send({
            "status": "Success"
          });
        } else {
          console.log("error inserting in db");
          res.status(404).send({
            "status": "Fail"
          });
        }
      });
    } else {
      console.log("error inserting in db");
      res.status(404).send({
        "status": "Duplicate"
      });
    }
  }
});

/*
 * REST API
 * POST
 * Add new user
 */
app.post('/admin/adduser/', function(req, res) {
  var userData = req.body;
  var username = userData.username;
  var password = userData.password;
  var email = userData.email;

  if ((username == null) || (!validator.isAlphanumeric(username)) || (!validator.isLength(username, 4, 16))) { //  Username validation
    console.log("Username invalid");
    res.status(404).send({
      "status": "Fail"
    });

  } else if ((email == null) || (!validator.isEmail(email))) { // Email validation
    console.log("Email invalid");
    res.status(404).send({
      "status": "Fail"
    });
  } else if ((password == null) || (!validator.isLength(password, 4, 16))) { // password length validation
    console.log("password length too short");
    res.status(404).send({
      "status": "Fail"
    });
  } else {
    console.log("username: " + username + "email: " + email);
    db.isUser(userData.username, function(status) {
      if (status == false) {
        db.addUserInDB(userData, function(status) {
          if (status == "ok") {
            console.log("User entered");
            res.send({
              "status": "Success"
            });
          } else {
            console.log("error inserting in db");
            res.status(404).send({
              "status": "Fail"
            });
          }
        });
      } else {
        console.log("user exists");
        res.status(404).send({
          "status": "Fail"
        });
      }
    });
  }
});

/*
 * REST API
 * GET
 * Get all tools mapped to a client
 */
app.get('/getallclienttools/:clientID', function(req, res) {
  clientID = req.params.clientID;
  db.getClientIds(clientID, function(toolList) {
    if (toolList == "error") {
      res.status(404).send("error in action");
    } else {
      res.send({
        "toolList": toolList
      });
    }
  });
});

/*
 * REST API
 * GET
 * Get email of the user
 */
app.get('/getemail/:username', function(req, res) {
  username = req.params.username;
  db.getEmail(username, function(email) {
    if (email == "error") {
      res.status(404).send("error in action");
    } else {
      res.send({
        "email": email
      });
    }
  });
});

/*
 * REST API
 * GET
 * Get list of all tools on server
 */
app.get('/admin/getallservertoolinfo/', function(req, res) {
  db.getAllTools(function(toolData) {
    if (toolData == "error") {
      res.status(404).send("error in action");
    } else {
      res.send({
        "toolList": toolData
      });
    }
  });
});

/*
 * REST API
 * GET
 * get list of all clients
 */
app.get('/admin/getallclients/', function(req, res) {
  db.getAllActiveClients(function(clients) {
    if (clients == "error") {
      res.status(404).send("error in action");
    } else {
      res.send({
        "clientID": clients
      });
    }
  });
});

/*
 * REST API
 * GET
 * Delete tool from server repository
 */
app.get('/admin/deleteservertool/:toolID', function(req, res) {
  toolID = req.params.toolID;
  db.getToolData(toolID, function(toolData) {
    var newPath = __dirname + "/tools/" + toolData.toolNPM + ".zip";
    fs.unlink(newPath, function(err) {
      if (err) console.log("error deleting zip file");
      db.removeToolData(toolID, function(status) {
        if (status == "ok") {
          res.send({
            "status": "Success"
          });
        } else {
          res.status(404).send({
            "status": "Fail"
          });
        }
      });
    });
  });
});

/*
 * REST API
 * GET
 * Get scan report from server submitted by client
 */
app.get('/getreport/:scanID', function(req, res) {
  var reportScanID = req.params.scanID;
  if (reportScanID == '') { //  ScanID validation
    console.log("ScanID Empty");
    res.status(404).send({
      "status": "Fail"
    });
  } else if (!validator.isNumeric(reportScanID)) {
    console.log("Invalid scanID");
    res.status(406).send({
      "status": "InvalidscanID"
    });

  } else {
    db.getReport(reportScanID, function(reportData) {
      if (reportData == false) {
        res.send("No report Available");
      } else {
        try {
          var parser = require('./tools/' + reportData.toolNPM + '/' + reportData.toolNPM + 'Parser.js');
          parser.parse(reportData, function(data) {
            res.send(data);
          });
        } catch (ex) {
          //run raw
          console.log("got exception");
          reportData.err = true;
          console.log(reportData);
          res.send(reportData);
        }
      }
    });
  }
});

/*
 * REST API
 * GET
 * Get list of attack by server
 */
app.get('/getattacklist/', function(req, res) {
  db.getAttackList(function(attakListData) {
    if (attakListData == false) {
      res.send("No attack list Available");
    } else {
      res.send(attakListData);
    }
  });
});

/*
 * REST API
 * GET
 * Get tool information from server without quering client
 */
app.get('/gettoolinfoserver/:toolID', function(req, res) {
  var toolID = req.params.toolID;
  db.getToolData(toolID, function(toolInfoData) {
    if (toolInfoData == false) {
      res.send("No information Available");
    } else {
      var filePath = path.join(__dirname + "/tools/" + toolInfoData.toolNPM + "/" + toolInfoData.toolNPM + ".json");
      fs.readFile(filePath, {
        encoding: 'utf-8'
      }, function(err, data) {
        if (!err) {
          res.send(JSON.parse(data));
        } else {
          console.log(err);
        }
      });
    }
  });
});

/*
 * REST API
 * GET
 * Get client ID for specified tool
 */
app.get('/getclientidfortoolid/:toolID', function(req, res) {
  var toolID = req.params.toolID;
  db.getClinetIDForTool(toolID, function(toolInfoData) {
    if (toolInfoData == false) {
      res.send("No information Available");
    } else {
      res.send(toolInfoData);
    }
  });
});

/*
 * REST API
 * GET
 * Get all users
 */
app.get('/getallusers', function(req, res) {
  db.getUsers(function(users) {
    var usersNames = {
      "userList": []
    }
    if (users == false) {
      res.send("No information Available");
    } else {
      for (var i = 0; i < users.length; i++) {
        usersNames.userList.push(users[i].username);
      }
      res.send(usersNames);
    }
  });
});

/*
 * Function
 * This function executes every 30 seconds. It will check timestamp of every
 * client and if client fails to send heartbeat by difference of 20 seconds,
 * respective client will be marked as "Inactive" in system.
 */
function changeClientStatus() {
  var currentTime = new Date().getTime();
  db.getAllActiveClientTime(function(clients) {
    for (var i = 0; i < clients.length; i++) {
      if ((currentTime - clients[i].timestamp) > 20 * 1000) {
        console.log("deactivate" + clients[i].clientID);
        db.updateClientStatus(clients[i].clientID, "Inactive", function(status) {
          if (status == "ok") {
            console.log("deactivated..");
          } else {
            console.log("error in DB entry");
          }
        });
      }
    }
    setTimeout(changeClientStatus, 30000);
  });
}

/*
 * Function
 * This function will download and install latest version of
 * drivers from update server to this server
 */
function downloadAndUpdate(toolID, version) {
  var request = http.get("http://" + updateServerInfo.serverIP + ":" + updateServerInfo.serverPort + "/getdriver/" + toolID, function(response) {
    if (response.statusCode === 200) {
      var file = fs.createWriteStream(__dirname + "/tools/" + toolID + ".zip");
      response.pipe(file);
      //var zip = new Admzip(file);
      //zip.extractAllTo( __dirname + "/tools/" , /*overwrite*/ true);
      toolData = {
        "toolID": toolID,
        "version": version
      }
      db.updateToolVersion(toolData, function(state) {
        if (state == "ok") {
          var zip = new Admzip(__dirname + "/tools/" + toolID + ".zip");
          zip.extractAllTo(__dirname + "/tools/", /*overwrite*/ true);
          console.log("tool updated successfully");
        } else {
          console.log("some error occured while updating tool");
        }
      });
    }
  });
}

/*
 * Function
 * This function executes every 30 seconds. It will check for current
 * verion of tools and update if update server has latest.
 */
function updateServerDrivers() {
  fs.readFile('updateServer.config', 'utf8', function(err, data) {
    if (err) {
      console.log('enable to read file for update server configuration')
    } else {
      updateServerInfo = JSON.parse(data);
      db.getAllToolsVersion(function(currentToolsVersion) {
        var options = {
          host: updateServerInfo.serverIP,
          port: updateServerInfo.serverPort,
          path: '/getversion',
          method: 'GET',
          headers: {
            'content-type': 'application/json'
          }
        };
        var request = http.request(options, function(runRes) {
          runRes.setEncoding('utf8');
          runRes.on('data', function(runStatus) {
            //console.log(JSON.parse(runStatus));
            latestVersion = JSON.parse(runStatus);
            //console.log(latestVersion.length);
            //Get tool IDs of which latest version are available
            for (var a = 0; a < latestVersion.length; a++) {
              var downloadCandidate = true;
              for (var b = 0; b < currentToolsVersion.length; b++) {
                if (latestVersion[a].toolID == currentToolsVersion[b].toolID) {
                  downloadCandidate = false;
                }
              }
              if (downloadCandidate == true) {
                downloadAndUpdate(latestVersion[a].toolID, latestVersion[a].version);
              }
            }
            for (var i = 0; i < latestVersion.length; i++) {
              var latVerSplit = latestVersion[i].version.split('.');
              for (var j = 0; j < currentToolsVersion.length; j++) {
                if (currentToolsVersion[j].toolID == latestVersion[i].toolID) {
                  var curVerSplit = currentToolsVersion[j].version.split('.');
                  if (latVerSplit[2] > curVerSplit[2]) {
                    //console.log(latestVersion);
                    downloadAndUpdate(latestVersion[i].toolID, latestVersion[i].version);
                  } else if (latVerSplit[1] > curVerSplit[1]) {
                    downloadAndUpdate(latestVersion[i].toolID, latestVersion[i].version);
                  } else if (latVerSplit[0] > curVerSplit[0]) {
                    downloadAndUpdate(latestVersion[i].toolID, latestVersion[i].version);
                  }
                }
              }
            }
          });
        });
        //request.write(JSON.stringify(toolList));
        request.on('error', function(e) {
          console.log(e.message);
          console.log("Update server not reachable");
          //res.send("error");
        });
        request.end();
        setTimeout(updateServerDrivers, config.updateTimeout);
      });
    }
  }); // readFile (updateserver.config)
}

/*
 * Function
 * This function executes when server comes up. It will fetch last value
 * assigned as scanID. It will store the last value of scanID in memory
 */
function restoreLastValues() {
  db.getLastScanId(function(lastScanData) {
    scanID = parseInt(lastScanData.value);
    console.log(scanID);
  });
}

http.createServer(app).listen(app.get('port'), function() {
  console.log("listening");
});

changeClientStatus();
restoreLastValues();
updateServerDrivers();