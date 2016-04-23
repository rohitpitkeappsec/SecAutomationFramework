var express = require('express');
var http = require('http');
var bodyParser = require("body-parser");
var connect = require('connect');
var fs = require('fs');
var path = require('path');
var request = require("request");
var session = require('express-session');
var pdf = require('html-pdf');
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
        getRandomNumber(64, function(status, randomNumber) {
          if (status === false) {
            res.redirect('/');
          } else {
            req.session.csrfCookie = randomNumber;
            res.cookie('csrfToken', randomNumber, {
              httpOnly: true
            });
            res.render('register.jade', {
              csrf: req.session.csrfCookie
            });
            console.log("New user");
          }
        });
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
          res.render("registeruserstatus.jade");
        }
      });
    } // else - validation success
  } else {
    res.send("Invalid CSRF token");
  }
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

        // console.log("BODY is :" + body)
        var clientID = JSON.parse(body).status;
        var tools = JSON.parse(body).data;
        var toolGroup = JSON.parse(body).toolGroup;


        console.log("Client id:" + clientID);
        console.log("Tools are :" + tools);
        var jsonBody = {};
        if (clientID == "No clients") {
          jsonBody.clientID = ['No Clients'];
        } else {
          jsonBody = JSON.parse(body).status;
        }
        var clientid = jsonBody.clientID;
        req.session.userClients = jsonBody.clientID;
        res.render("index.jade", {
          dataclient: clientid,
          toolslist: tools,
          toolGroup: toolGroup,
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
          console.log("Tool list is :" + toolList);
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
          console.log("Keys are :" + keys);
          req.session.runBody = jsonBody;
          req.session.currentClient = req.params.clientid;
          req.session.currentTool = req.params.toolid;
          res.render("toolinfo.jade", {
            keys: keys,
            toolname: req.session.currentTool,
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
        url: "http://" + config.serverIP + ":" + config.serverPort + "/runtool/" + req.session.currentClient + "/" + req.session.currentTool + "/" + req.session.userName,
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
  var pendingCB = -1; // global for checking when we are done with collecting all
  var requestCount = 0; // global counter for number of report requests made
  if (req.session.userAuth != true) {
    res.redirect('/'); //unauthenticated session, so redirect to home page
  } else {

    var csrfBodyToken = req.body.csrf;
    var cookieArray = req.headers.cookie.split(";");
    var csrfCookie = "";

    // check for CSRF token
    for (var i = 0; i < cookieArray.length; i++) {
      var tempArr = cookieArray[i].split("csrfToken=");
      if (tempArr.length == 2) {
        csrfCookie = tempArr[1];
      }
    }
    if (csrfBodyToken != csrfCookie) {
      res.send("Invalid CSRF token"); // invalid CSRF token, return error
    } else {

      // Session validated
      // scanid for undefined or null ?
      var scanid = req.body.scanid;
      console.log("Scan Id: " + scanid);

      if ((scanid == null) || (scanid == "")) {
        error = "ERROR: Missing or invalid scan ID ";
        res.send(error);
      } else {

        // scan ID are not null or empty, so process each
        // We may have multiple scan-ids with comma as separator
        // validate each scan id for numeric and positive value

        var array = scanid.toString().split(",");
        var numScanIds = array.length;

        // ##### DEBUG
        console.log("Scan Id array length: " + array.length);
        console.log("First Scan Id : " + array[0]);


        // ##### DEBUG

        // hml file for collecting the multi-scanID report
        var reportPath = __dirname + "/" + req.session.userName + "_temp.html";
        fs.writeFileSync(reportPath, ""); // create an empty file
        console.log("Temp file created");
        requestCount = 0; // number of requests made to server - increment when making requests`

        // Determine the number of valid scanIDs - we will count this down in the callbacks
        for (pendingCB = numScanIds, i = 0; i < numScanIds; i++) {
          // validate scan id
          var currScanId = array[i];
          if ((currScanId == null) || (currScanId == "") || (currScanId === undefined) || currScanId <= 0 || (!validator.isNumeric(currScanId))) {
            console.log("Invalid scan ID: " + currScanId);
            --pendingCB; // one less call back with report expected
          }
        } // determine the number of valid scan IDs
        console.log("Number of callback PendingCB:" + pendingCB);


        // for each (valid) scan id, obtain the parsed report
        for (i = 0; i < numScanIds; i++) { //index is one less, so i<numScanIds
          // validate scan id
          var currScanId = array[i];
          if ((currScanId == null) || (currScanId == "") || (currScanId === undefined) || currScanId <= 0 || (!validator.isNumeric(currScanId))) {
            //console.log("Invalid scan ID: " + currScanId);
            continue;
          } // else valid scan id
          var options = {
              url: "http://" + config.serverIP + ":" + config.serverPort + "/getreport/" + encodeURIComponent(req.session.userName) + "/" + encodeURIComponent(currScanId),
              method: "GET"
            } // options

          // for each scan id, request the report

          ++requestCount;
          request(options, function(error, response, body) {

            --pendingCB; // We are in the callback - decrement pending call back count

            // ### DEBUG
            console.log("One more call back done: " + pendingCB + "still to go");

            var reportPath = __dirname + "/" + req.session.userName + "_temp.html";
            if (error || (body == "error")) {
              console.log("Error: " + error + body);
              var err_msg = "<br> <br> Error occured processing the report for Scan ID " + jsonBody.scanid + "<br><br>";
              fs.appendFileSync(reportPath, err_msg);

            } else {
              var jsonBody = JSON.parse(body);

              if ((jsonBody.status == "InvalidscanID") || (jsonBody.status == "No report Available") || (jsonBody.err == true)) {

                var err_msg = "<br> <br> Error : " + jsonBody.status + " for Scan ID " + jsonBody.scanid + "<br><br>";
                fs.appendFileSync(reportPath, err_msg);

              } else {

                var htmltemp = createHTMLstring(jsonBody);
                // we write this html to a file temporarily in local folder
                fs.appendFileSync(reportPath, htmltemp);
              } // report obtained

            } // JSON report obtained, no error

            // if all reports obtained, then generate pdf

            if (pendingCB == 0) { // all callbacks have been received
              var FinalreportPath = __dirname + "/" + req.session.userName + "_temp.html";
              var multi_htmlreport = fs.readFileSync(FinalreportPath);
              multi_htmlreport = "<html> <body> " + multi_htmlreport + "</body> </html>";
              //console.log(multi_htmlreport);
              var reportfilenamepdf = "./" + req.session.userName + "_report_multi.pdf";
              // Now we create a single PDF file
              var options = {
                format: 'Letter'
              };
              pdf.create(multi_htmlreport, options).toFile(reportfilenamepdf,
                function(error, success) {
                  if (error) {
                    console.log("unable to create pdf");
                    res.send("Error occured when creating pdf");
                  } else {
                    //console.log(reportfilenamepdf);
                    //res.send(multi_htmlreport);
                    res.sendFile(path.join(__dirname, '/') + reportfilenamepdf);
                    // ideally we should delete the temp.html and report_multi.pdf
                  }
                });
              //res.send(multi_htmlreport);
            } // if pendingCB == 0
          }); // report request
        } // for each scanid in the list requesting the report

        // at the end of the for loop, if we made no requests then all scanIDs are invalid
        // need to return error
        if (requestCount == 0) {
          res.send("Invalid scan ID(s) - no report to generate");
        }

      } // not null or empty scanid field in the report request
    } // CSRF token validated
  } // authenticated session
});

var createHTMLstring = function(jsonData) {
  completeBody = "";
  completeBody = completeBody + "<h2 style='text-align:center'>" + jsonData.metadata.reportname + " </h2>";//change
  completeBody = completeBody + "Scan ID : " + jsonData.metadata.scanid + "</br>";
  completeBody = completeBody + "Target host : " + jsonData.metadata.target + "</br></br>";
  var tableBody = "";
  for (var i = 0; i < jsonData.reportdata.length; i++) {
    tableBody = tableBody + "<tr>";
    tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].label + "</td>";
    tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].desc + "</td>";
    if (jsonData.reportdata[i].reportdata != null) {
      tableBody = tableBody + "<td style='border:medium black solid'>" + jsonData.reportdata[i].reportdata + "</td>";
    }
    tableBody = tableBody + "</tr>"
  }
  completeBody = completeBody + "<table style='width:60%; font-size:8px'>" + tableBody + "</table>" + "<br> <br>";//change

  //  completeBody = "<body>" + completeBody + "</body>";
  //  completeBody = "<html>" + completeBody + "</html>";

  return completeBody;
}

app.get('/tools', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/getTools/",
      method: "GET"
    }
    request(options, function(error, response, body) {
      //console.log("All Tool List :" + body);
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var toolList = JSON.parse(body).data;
        var toolgroup = JSON.parse(body).toolgroup;
        //	console.log("Parse data : " + summaryData);
        res.render("tools.jade", {
          toolslist: toolList,
          toolgroup: toolgroup,
          csrf: req.session.csrfCookie
        });
      }
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
  var pendingCB = -1;
  var requestCount = 0;
  var errormsg;
  var ToolGroupName = "";
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
      var clientList = req.body.clientid;
      var numIds = 1;

      console.log("clientid = " + clientList);
      console.log("toolid = " + toolid);
      console.log("All client ids :" + req.session.userClients);
      if (clientList == "all") {
        clientList = req.session.userClients;
      }
      // validate client ids from the list and count valid clients ###############################################


      var array = clientList.toString().split(",");
      var numclientIds = array.length;
      var numValidclientIds = numclientIds;


      for (i = 0; i < numclientIds; i++) {
        // validate scan id
        var clientid = array[i];
        if ((!validator.isNumeric(clientid)) || (clientid <= 0)) {
          console.log("Invalid client ID: " + clientid);
          array.splice(i, 1);
          --numValidclientIds; // one less call back with report expected
        }
      } // determine the number of valid scan IDs
      console.log("Number of Valid launchers : " + numValidclientIds);
      /* For toolid is more than one */

      // validate tool ids from the list and count valid tools  ###############################################
      var numToolid = 1;
      var numValidToolid = 1;
      var arraytoolid = toolid;
      if (validator.contains(toolid, '/')) {
        var data = toolid.toString().split("/");
        console.log("Data of toolGroup: " + data);
        var ToolGroupName = data[0];
        var toolid = data[1];

        console.log("ToolGroupNAme in upload :" + ToolGroupName);
      } // if close

      var arraytoolid = toolid.toString().split(",");
      var numToolid = arraytoolid.length;
      var numValidToolid = numToolid;


      console.log("Tools for in toolGroup:" + toolid);

      for (i = 0; i < numToolid; i++) {
        // validate scan id
        var toolid = arraytoolid[i];
        if (!validator.isAlphanumeric(toolid)) {
          console.log("Invalid Tool ID: " + toolid);
          arraytoolid.splice(i, 1);
          --numValidToolid; // one less call back with report expected
        }
      } // determine the number of valid scan IDs
      console.log("Number of Valid Toolids : " + numValidToolid);


      pendingCB = numValidclientIds * numValidToolid; // Making this many request and expecting so many call backs
      if (pendingCB <= 0) {
        res.send("No valid clients or no valid tool ids: Nothing to do");
      } else {
        errormsg = "";

        for (var j = 0; j < numToolid; j++) { // index is one less so i< numToolid 
          var toolid = arraytoolid[j];
          if (!validator.isAlphanumeric(toolid)) {
            continue;
          } // else pick next tool

          for (var i = 0; i < numclientIds; i++) { //index is one less, so i<numScanIds
            // validate client id
            var clientid = array[i];
            if ((!validator.isNumeric(clientid)) || (clientid <= 0)) {
              continue;
            } // else pick next client

            // Push this tool to this client 

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
              --pendingCB;
              console.log("One more call back done to push tool to client : " + pendingCB + "still to go");

              if (error || (body == "error")) {
                console.log("ERROR :" + error);
                errormsg = errormsg + ":ERROR:" + error;
                console.log("Some call back error:" + errormsg);
                //res.send("Some error occured");
              } else {
                if (pendingCB == 0) {
                  if (ToolGroupName != "") {
                    console.log("Toolgroup push to all clients done ");
                    var body = {
                      "clientList": clientList.toString(),
                      "ToolGroupName": ToolGroupName
                    };

                    var headers = {
                      'Content-Type': 'application/json'
                    }
                    var options = {
                      url: "http://" + config.serverIP + ":" + config.serverPort + "/admin/pushclienttoolGroup/",
                      headers: headers,
                      method: "POST",
                      body: JSON.stringify(body)
                    }
                    request(options, function(error, response, body) {
                      //console.log("All Tool List :" + body);
                      if (error) {
                        console.log(error);
                        res.send("Some error occured");
                      } else if (body == "error") {
                        res.send("Some error occured on client");
                      } else {
                        res.render("pushstatus.jade", {
                          csrf: req.session.csrfCookie
                        });
                      }
                    });

                  } else {

                    console.log("Tool push to client(s) done ");
                    res.render("pushstatus.jade", {
                      csrf: req.session.csrfCookie
                    });
                  }

                } // All requests completed
              } // if error/else completed

            }); // request completed
          } // numclientid for  loop completed
        } // for toolid for loop completed
      }
    } else {
      res.send("Invalid CSRF token");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/settings', function(req, res) { // praveen changes for username popup
  if (req.session.userAuth == true) {
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
        res.render("settings.jade", {
          userid: userList,
          csrf: req.session.csrfCookie
        });
      }
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

app.get('/summary', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/getsummary/" + req.session.userName,
      method: "GET"
    }
    request(options, function(error, response, body) {
      // console.log("All body Summary UI :" + body);
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var summaryData = JSON.parse(body);
        //	console.log("Parse data : " + summaryData);
        res.render("summary.jade", {
          summaryData: summaryData,
          csrf: req.session.csrfCookie
        });
      }
    });
  } else {
    res.redirect('/');
  }
});


app.get('/custom', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/getTools/",
      method: "GET"
    }
    request(options, function(error, response, body) {
      //console.log("All Tool List :" + body);
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var toolList = JSON.parse(body).data;
        //	console.log("Parse data : " + summaryData);
        res.render("custom.jade", {
          toolslist: toolList,
          csrf: req.session.csrfCookie
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/createGroup', function(req, res) {
  var ToolGroupName = req.body.ToolGroupName;
  var toolnameList = req.body.toolID;
  // console.log("Data from UI :" + ToolGroupName + "Tools :" + toolnameList);
  var headers = {
    'Content-Type': 'application/json'
  }
  var options = {
    url: "http://" + config.serverIP + ":" + config.serverPort + "/createToolGroup/",
    headers: headers,
    method: "POST",
    form: {
      'ToolGroupName': ToolGroupName,
      'toolnameList': toolnameList.toString()
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
      res.send("Tool Group Created Successfully !!!");
    }
  });

});

app.get('/gettoolgroup/:groupname', function(req, res) {
  //  if (req.session.userAuth == true) {
  var toolgroupname = req.params.groupname;
  // console.log("Tool Group Name : " + toolgroupname); 
  // res.render("toolgroupconfigure.jade");
  if (req.session.userAuth == true) {

    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/gettoolgroup/" + encodeURIComponent(toolgroupname),
      method: "GET",
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        // console.log("Tool list in body :" + body );
        var toolList = body.toString().split(",");

        // console.log("Tool list is :" + toolList );
        res.render("toollistGroup.jade", {
          tools: toolList,
          toolgroupname: toolgroupname,
          csrf: req.session.csrfCookie
        });
      }
    });

  } else {
    res.redirect('/');
  }
});
app.get('/toolgroupconfigure', function(req, res) {
  if (req.session.userAuth == true) {
    res.render("toolgroupconfigure.jade", {
      csrf: req.session.csrfCookie
    });
  } else {
    res.redirect('/');
  }
});

app.get('/pushtoolgroup', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://" + config.serverIP + ":" + config.serverPort + "/getalltoolGroup/",
      method: "GET"
    }
    request(options, function(error, response, body) {
      // console.log("toolgroup select:" + body);
      if (error) {
        console.log(error);
        res.send("Some error occured");
      } else if (body == "error") {
        res.send("Some error occured on client");
      } else {
        var toolList = JSON.parse(body);
        res.render("toolGroupselect.jade", {
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


http.createServer(app).listen(app.get('port'), function(req, res) {
  console.log('Listing to port ' + config.port);
});
