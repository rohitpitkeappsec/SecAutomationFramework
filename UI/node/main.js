var express = require('express');
var http = require('http');
var bodyParser = require("body-parser");
var connect = require('connect');
var fs = require('fs');
var path = require('path');
var request = require("request");
var session = require('express-session');
var htmlToPdf = require('html-to-pdf');
var multer = require('multer');
var FormData = require('form-data');
var crypto = require('crypto');
var config = require('./config.json');
var validator = require('validator');

var app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'gfty656rur67rbui7rcerwyi7',
  httpOnly: true,
  saveUninitialized: true,
  resave: true
}));
app.use(bodyParser.json());
app.set('port', config.port)
app.set('views'.__dirname + '/views');
app.set('view engine', 'jade');


var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './temptools/')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({
  storage: storage
});


var getRandomNumber = function(size, callback) {
  crypto.pseudoRandomBytes(size, function(error, data) {
    if (error) {
      callback(false, null);
    }
    var randomNumber = data.toString('hex');
    callback(true, randomNumber);
  });
}

app.get('/', function(req, res) {

  if (req.session.userAuth == true)
    res.redirect('/home');
  //    res.render("index.jade");
  else { //Get first timelogin credentials
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/firstlogin/",
      method: "GET",
    }
    request(options, function(error, response, body) {
      console.log("Is this first login : " + body);
      console.log("body of status:" + JSON.parse(body).status);
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (JSON.parse(body).status == "true") {
        res.render('register.jade');
        console.log("New user");
      } else {
        res.render('login.jade');
      }
    });
  }
});


app.get('/css/:file', function(req, res) {
  //validate file name and path - dont allow dots and slashes in the file name
  res.sendFile('css/' + req.params.file, {
    root: path.join(__dirname, '')
  });
});

app.get('/js/:file', function(req, res) {
  //validate file name and path - dont allow dots and slashes in the file name
  res.sendFile('js/' + req.params.file, {
    root: path.join(__dirname, '')
  });
});

app.post('/register', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  console.log("Registering user : " + req.body.username);
  // validate user name length, alphanumeric, password length and email
  if ((username == null) || (password == null) || (email == null) || (!validator.isLength(username, 4, 16)) || (!validator.isAlphanumeric(username)) || (!validator.isLength(password, 4, 16)) || (!validator.isEmail(email))) {
    console.log("Usrname, Password or email validation Fail");
    console.log("Username must be 4 to 16 chars long, alpha numeric");
    console.log("Password - 4 to 16 chars long");
    console.log("Email - a valid email with id@domain format");
    res.send("Invalid Username or Password Format");
  } else {
    var body = {
      "username": req.body.username,
      "password": req.body.password,
      "email": req.body.email
    };
    var headers = {
      'Content-Type': 'application/json'
    }
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/adduser/",
      headers: headers,
      method: "POST",
      body: JSON.stringify(body)
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      }
      if (JSON.parse(body).status == "Fail") {
        res.send("user exists or Invalid");
      } else if (JSON.parse(body).status == "InvalidUser") {
        res.send("Username format invalid");
      } else if (JSON.parse(body).status == "InvalidEmail") {
        res.send("Email format invalid");
      } else {
        res.render("registeruserstatus.jade", {

        });
      }
    });
  } // else - validation success

});

app.post('/loginauth', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //validate user name contains only alphanumeric values, length minimum 4, maximum 16
  //validate password length minimum 4, maximum 16
  console.log("Username = " + username);
  if ((!validator.isLength(username, 4, 16)) || (!validator.isAlphanumeric(username)) || (!validator.isLength(password, 4, 16))) {
    console.log("Usrname and Password validation Fail");
    res.send("Invalid Username or Password Format");
  } else {
    var headers = {
      'Content-Type': 'application/json'
    }
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/authenticate/",
      headers: headers,
      method: "POST",
      form: {
        'userName': username,
        'password': password
      }
    }

    request(options, function(error, response, body) {
      if (error) {
        req.session.userAuth = false;
        res.redirect('/');
        console.log(error);
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var jsonBody = JSON.parse(body)
          //console.log(jsonBody);
        console.log(jsonBody.status);
        if (jsonBody.status == 'Success') {
          req.session.userAuth = true;
          req.session.userName = username;
          getRandomNumber(64, function(status, randomNumber) {
            if (status === false) {
              res.redirect('/');
            } else {
              req.session.csrfCookie = randomNumber;
              res.cookie('csrfToken', randomNumber, {
                httpOnly: true
              });
              res.redirect('/home/');
            }
          });
        } else {
          req.session.userAuth = false;
          res.redirect('/');
        }
      }
    });
  }
});

app.get('/home/', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/getclients/" + req.session.userName,
      method: "GET",
    }

    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var jsonBody = {};
        if (body == "No clients") {
          jsonBody.clientID = ['No Clients'];
        } else {
          jsonBody = JSON.parse(body);
        }
        var clientID = jsonBody.clientID;
        req.session.userClients = jsonBody.clientID;
        res.render("index.jade", {
          dataclient: clientID,
          csrf: req.session.csrfCookie
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.get('/logout/:csrf', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.params.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {
      req.session.destroy();
      res.redirect('/');
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/gettools/:clientid', function(req, res) {
  if (req.session.userAuth == true) {

    // validate clientid - must be numeric
    var client = req.params.clientid;
    //console.log("Client id=" + client);
    if ((!validator.isNumeric(client))) {
      res.send("Invalid clientID Format");
    } else {

      var options = {
        url: "http://" + config.serverIP + ":" + config.serverPort + "/getallclienttools/" + encodeURIComponent(req.params.clientid),
        method: "GET",
      }
      request(options, function(error, response, body) {
        if (error) {
          console.log(error);
          res.send("Some error occured");
        } else if (body == "error") {
          res.send("Some error occured on client");
        } else {
          var jsonBody = JSON.parse(body)
          var toolList = jsonBody.toolList;
          res.render("toollist.jade", {
            tools: toolList,
            client: req.params.clientid,
            csrf: req.session.csrfCookie
          });
        }
      });
    }
  } else {
    res.redirect('/');
  }
});

app.get('/gettoolinfo/:clientid/:toolid', function(req, res) {
  if (req.session.userAuth == true) {
    var client = req.params.clientid;
    var toolid = req.params.toolid;

    console.log("clientid = " + client);
    console.log("toolid = " + toolid);

    // validate clientid and toolid   //###done
    if ((!validator.isNumeric(client)) || (!validator.isAlphanumeric(toolid))) {
      res.send("Invalid clientID/toolName Format");
    } else {
      var options = {
        url: "http://" + config.serverIP + ":" + config.serverPort + "/gettoolinfo/" + encodeURIComponent(req.params.clientid) + "/" + encodeURIComponent(req.params.toolid),
        method: "GET",
      }
      request(options, function(error, response, body) {
        if (error) {
          console.log(error);
          res.send("Some error occured");
        } else if (body == "error") {
          res.send("Some error occured on client");
        } else {
          var jsonBody = JSON.parse(body);
          var keys = Object.keys(jsonBody);
          console.log(keys);
          req.session.runBody = jsonBody;
          req.session.currentClient = req.params.clientid;
          req.session.currentTool = req.params.toolid;
          res.render("toolinfo.jade", {
            keys: keys,
            values: jsonBody,
            csrf: req.session.csrfCookie
          });
        }
      });
    }
  } else {
    res.redirect('/');
  }
});

// delete tool from a launcher system

app.get('/deleteclienttool/:clientid/:toolid', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/deleteclienttool/" + encodeURIComponent(req.params.clientid) + "/" + encodeURIComponent(req.params.toolid),
      method: "GET",
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var jsonBody = JSON.parse(body);
        if (jsonBody.status == "Fail") {
          res.send("Some error occured on client");
        } else if (jsonBody.status == "Success") {
          res.render("deltoolclient.jade", {
            csrf: req.session.csrfCookie
          });
        }
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/runtool', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {
      var runBody = req.session.runBody;
      var keys = Object.keys(runBody);
      for (var i = 0; i < keys.length; i++) {
        var values = {
          "value": req.body[keys[i]]
        }
        runBody[keys[i]] = values;
      }
      var headers = {
        'Content-Type': 'application/json'
      }
      var options = {
        url: "http://" + config.serverIP + ":" + config.serverPort + "/runtool/" + req.session.currentClient + "/" + req.session.currentTool,
        headers: headers,
        method: "POST",
        body: JSON.stringify(runBody)
      }
      request(options, function(error, response, body) {
        if (error) {
          console.log(error);
          res.send("Some error occured");
        } else if (body == "error") {
          res.send("Some error occured on client");
        } else {
          var jsonBody = JSON.parse(body);
          res.render("runtool.jade", {
            scanid: jsonBody.scanID,
            csrf: req.session.csrfCookie
          });
        }
      });
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/report', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("report.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.post('/getreport', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {
      // validate scanid for undefined or null
      var scanid = req.body.scanid;
      console.log(scanid);

      if ((scanid == null) || (scanid == "") || (!validator.isNumeric(scanid)) || (scanid <= 0)) {
        error = "ERROR: Missing or invalid scan ID ";
        res.send(error);
      } else {
        var options = {
          url: "http://" + config.serverIP + ":" + config.serverPort + "/getreport/" + encodeURIComponent(req.body.scanid),
          method: "GET"
        }
        request(options, function(error, response, body) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          } else if (body == "error") {
            res.send("Some error occured on client");
          } else if (body == "No report Available") {
            res.send("No report Available");
          } else {
            console.log(body);
            var jsonBody = JSON.parse(body);

            if (jsonBody.status == "InvalidscanID") {
              res.send("ScanID invalid");
            }

            if (jsonBody.err == true) {
              res.send(body);
            } else {
              var html = createHTMLstring(jsonBody);
              //console.log(html);
              var reportfilename = "./report_" + req.session.userName + ".pdf"; // remove test.pdf
              htmlToPdf.convertHTMLString(html, reportfilename, function(error, success) {
                if (error) {
                  console.log("unable to create pdf");
                } else {
                  res.sendFile(path.join(__dirname, '/') + reportfilename);
                }
              });
            }
          }
        });
      }
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

var createHTMLstring = function(jsonData) {
  completeBody = "";
  completeBody = completeBody + "<h1 style='text-align:center'>" + jsonData.metadata.reportname + " </h1>";
  completeBody = completeBody + "Scan ID : " + jsonData.metadata.scanid + "</br>";
  completeBody = completeBody + "Target host : " + jsonData.metadata.target + "</br></br>";
  var tableBody = "";
  for (var i = 0; i < jsonData.reportdata.length; i++) {
    tableBody = tableBody + "<tr>";
    tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].label + "</td>";
    tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].desc + "</td>";
    tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].reportdata + "</td>";
    tableBody = tableBody + "</tr>"
  }
  completeBody = completeBody + "<table style='width:60%; font-size:13px'>" + tableBody + "</table>";
  completeBody = "<body>" + completeBody + "</body>";
  completeBody = "<html>" + completeBody + "</html>";
  return completeBody;
}

app.get('/tools', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("tools.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.get('/uploadtoserver', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("uploadserver.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.post('/uploadtoolzip', upload.single('tooldriver'), function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {
      var form = new FormData();
      console.log(req.file);
      if (req.file != undefined) {
        var toolID = req.file.originalname;
        form.append('filename', fs.createReadStream(req.file.path));
        var request = http.request({
          method: 'POST',
          host: config.serverIP,
          port: config.serverPort,
          path: "/admin/uploadtoolserver/",
          headers: form.getHeaders()
        });
        //  console.log(form.filename);
        form.pipe(request);
        request.on('response', function(resEngine) {
          console.log(resEngine.statusCode);
          if (resEngine.statusCode == "200") {
            fs.unlink(req.file.path);
            res.render('uploadstatus.jade', {
              csrf: req.session.csrfCookie
            });
          } else {
            console.log("Error uploading");
            fs.unlink(req.file.path);
            res.status(404).send({
              "status": "Fail"
            });
          }
        });
        request.on('error', function(e) {
          console.log('problem with request: ' + e.message);
          fs.unlink(req.file.path);
          res.send("Some error occured");
        });
      } else {
        res.send("Some data missing");
      }
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/pushtoclient', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/getallservertoolinfo/",
      method: "GET"
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var toolList = JSON.parse(body).toolList;
        res.render("toolselect.jade", {
          clientid: req.session.userClients,
          toollist: toolList,
          csrf: req.session.csrfCookie
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/tooltoclient', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {
      var toolid = req.body.toolid;
      var clientid = req.body.clientid;

      console.log("clientid = " + clientid);
      console.log("toolid = " + toolid);
      // Validate that toolid and clientid
      // Either explicitly check for typeof clientid === 'undefined'
      // or just check for null value, which includes check for undefined values
      // toolid must be alphanumeric, clientid must be only numeric
      if ((clientid == null) || (toolid == null) || (!validator.isNumeric(clientid)) || (!validator.isAlphanumeric(toolid)) || (clientid <= 0)) {
        error = "ERROR: Missing or invalid client ID and/or tool name";
        res.send(error);
      } else {
        var body = {
          "clientID": clientid,
          "toolID": toolid
        };

        var headers = {
          'Content-Type': 'application/json'
        }
        var options = {
          url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/pushtoolclient/",
          headers: headers,
          method: "POST",
          body: JSON.stringify(body)
        }
        request(options, function(error, response, body) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          } else if (body == "error") {
            res.send("Some error occured on client");
          } else {
            var toolList = JSON.parse(body).toolList;
            res.render("pushstatus.jade", {
              csrf: req.session.csrfCookie
            });
          }
        });
      }
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/settings', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("settings.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.get('/adduserui', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("adduserui.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.post('/adduser', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }

    if (csrfBodyToken == csrfCookie) {
      var username = req.body.userid;
      var password = req.body.password;
      var email = req.body.email;

      // validate user name length, alphanumeric, password length and email
      if ((username == null) || (password == null) || (email == null) || (!validator.isLength(username, 4, 16)) || (!validator.isAlphanumeric(username)) || (!validator.isLength(password, 4, 16)) || (!validator.isEmail(email))) {
        console.log("Usrname, Password or email validation Fail");
        console.log("Username must be 4 to 16 chars long, alpha numeric");
        console.log("Password - 4 to 16 chars long");
        console.log("Email - a valid email with id@domain format");
        res.send("Invalid Username or Password Format");
      } else {
        var body = {
          "username": req.body.userid,
          "password": req.body.password,
          "email": req.body.email
        };
        var headers = {
          'Content-Type': 'application/json'
        }
        var options = {
          url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/adduser/",
          headers: headers,
          method: "POST",
          body: JSON.stringify(body)
        }
        request(options, function(error, response, body) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          }
          if (JSON.parse(body).status == "Fail") {
            res.send("user exists or Invalid");
          } else if (JSON.parse(body).status == "InvalidUser") {
            res.send("Username format invalid");
          } else if (JSON.parse(body).status == "InvalidEmail") {
            res.send("Email format invalid");
          } else {
            res.render("adduserstatus.jade", {
              csrf: req.session.csrfCookie
            });
          }
        });
      } // else - validation success
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/userclientui', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/getallclients/",
      method: "GET"
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        //console.log(body);
        var clientList = JSON.parse(body).clientID;
        var userOpt = {
          url: "http://" + config.serverIP + ":" + config.serverPort + "/getallusers",
          method: "GET"
        }
        request(userOpt, function(error, userRes, userBody) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          } else if (userBody == "error") {
            res.send("Some error occured on client");
          } else {
            console.log(userBody);
            var userList = JSON.parse(userBody).userList;
            res.render("userclientui.jade", {
              clientid: clientList,
              userid: userList,
              csrf: req.session.csrfCookie
            });
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/userclientmap', function(req, res) {
  if (req.session.userAuth == true) {
    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken == csrfCookie) {

      var clients = req.session.userClients;
      var clientid = req.body.clientid;
      var user = req.body.userid;

      console.log("client ID= " + clientid);
      console.log("list of client IDs= " + clients);
      console.log("Username = " + user);

      // Validate that toolid and clientid
      // check for null value, which includes check for undefined values
      // toolid must be alphanumeric, clientid must be only numeric
      if ((user == null) || (clientid == null) || (!validator.isAlphanumeric(user)) || (!validator.isNumeric(clientid)) // ### please validate the client
        || (clientid <= 0)) {
        error = "ERROR: Missing or invalid UserID and/or ClientID";
        res.send(error);
      } else {

        // check for duplicate client id mapping request,
        // or if this is the first client for this user
        for (var i = 0; i < clients.length; i++) {
          if (clients[i] == clientid) {
            res.send(" Duplicate client id");
            return;
          }
          if (clients[i] == 'No Clients') {
            clients.splice(i, 1);
          }
        }

        // client id and user id both valid, not previously mapped
        clients.push(parseInt(req.body.clientid));

        var body = {
          "username": req.body.userid,
          "clientID": clients
        };
        var headers = {
          'Content-Type': 'application/json'
        }
        var options = {
          url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/userclientmap/",
          headers: headers,
          method: "POST",
          body: JSON.stringify(body)
        }
        request(options, function(error, response, body) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          } else if (JSON.parse(body).status == "Fail") {
            res.send("Username or ClientID missing");
          } else {
            if (JSON.parse(body).status == "Duplicate") {
              res.send("Found Duplicate clients");
            } else {
              res.render("mapuserclientstatus.jade", {
                csrf: req.session.csrfCookie
              });
            }
          }
        });
      }
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

http.createServer(app).listen(app.get('port'), function(req, res) {
  console.log('Listing to port ' + config.port);
});
