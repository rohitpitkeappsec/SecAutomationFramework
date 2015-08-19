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
app.set('port', process.env.PORT || 80)
app.set('views'.__dirname + '/views');
app.set('view engine', 'jade');
app.use(multer({
  dest: './temptools/',
  rename: function(fieldname, filename, req, res) {
    return filename;
  }
}));

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
    res.render("index.jade");
  else
    res.render('login.jade');
});

app.get('/css/:file', function(req, res) {
  res.sendFile('css/' + req.params.file, {
    root: path.join(__dirname, '')
  });
});

app.get('/js/:file', function(req, res) {
  res.sendFile('js/' + req.params.file, {
    root: path.join(__dirname, '')
  });
});

app.post('/loginauth', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var headers = {
    'Content-Type': 'application/json'
  }
  var options = {
    url: "http://localhost:4040/authenticate/",
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
});

app.get('/home/', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://localhost:4040/getclients/" + req.session.userName,
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
    var options = {
      url: "http://localhost:4040/getallclienttools/" + req.params.clientid,
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
  } else {
    res.redirect('/');
  }
});

app.get('/gettoolinfo/:clientid/:toolid', function(req, res) {
  if (req.session.userAuth == true) {
    console.log(req.params.clientid);
    var options = {
      url: "http://localhost:4040/gettoolinfo/" + req.params.clientid + "/" + req.params.toolid,
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
        url: "http://localhost:4040/runtool/" + req.session.currentClient + "/" + req.session.currentTool,
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
      console.log(req.body.scanid);
      if (req.body.scanid != "") {
        var options = {
          url: "http://localhost:4040/getreport/" + req.body.scanid,
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
            if (jsonBody.err == true) {
              res.send(body);
            } else {
              var html = createHTMLstring(jsonBody);
              //console.log(html);
              htmlToPdf.convertHTMLString(html, './test.pdf', function(error, success) {
                if (error) {
                  console.log("enable to create pdf");
                } else {
                  res.sendFile(path.join(__dirname, '') + '/test.pdf');
                }
              });
            }
          }
        });
      } else {
        res.send("Invalid ScanID");
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
  completeBody = completeBody + "Scan ID : " + jsonData.metadata.scanid + "</br></br>";
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

app.post('/uploadtoolzip', function(req, res) {
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
      if (req.files.tooldriver != undefined) {
        var toolID = JSON.stringify(req.files.tooldriver.name).split("\"")[1].split(".zip");
        form.append('filename', fs.createReadStream(req.files.tooldriver.path));
        var request = http.request({
          method: 'POST',
          host: "localhost",
          port: 4040,
          path: "/admin/uploadtoolserver/",
          headers: form.getHeaders()
        });
        form.pipe(request);
        request.on('response', function(resEngine) {
          console.log(resEngine.statusCode);
          if (resEngine.statusCode == "200") {
            fs.unlink(req.files.tooldriver.path);
            res.render('uploadstatus.jade', {
              csrf: req.session.csrfCookie
            });
          } else {
            console.log("Error uploading");
            res.status(404).send({
              "status": "Fail"
            });
          }
        });
        request.on('error', function(e) {
          console.log('problem with request: ' + e.message);
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
      url: "http://localhost:4040/admin/getallservertoolinfo/",
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
      var body = {
        "clientID": clientid,
        "toolID": toolid
      };
      var headers = {
        'Content-Type': 'application/json'
      }
      var options = {
        url: "http://localhost:4040/admin/pushtoolclient/",
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
      var body = {
        "username": req.body.userid,
        "password": req.body.password,
        "email": req.body.email
      };
      var headers = {
        'Content-Type': 'application/json'
      }
      var options = {
        url: "http://localhost:4040/admin/adduser/",
        headers: headers,
        method: "POST",
        body: JSON.stringify(body)
      }
      request(options, function(error, response, body) {
        if (error) {
          console.log(error);
          res.send("Some error occured");
        } else {
          res.render("adduserstatus.jade", {
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

app.get('/userclientui', function(req, res) {
  if (req.session.userAuth == true) {
    var options = {
      url: "http://localhost:4040/admin/getallclients/",
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
          url: "http://localhost:4040/getallusers",
          method: "GET"
        }
        request(userOpt, function(error, userRes, userBody) {
          if (error) {
            console.log(error);
            res.send("Some error occured");
          } else if (userBody == "error") {
            res.send("Some error occured on client");
          } else {
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
      clients.push(parseInt(req.body.clientid));
      //console.log(clients);
      var body = {
        "username": req.body.userid,
        "clientID": clients
      };
      var headers = {
        'Content-Type': 'application/json'
      }
      var options = {
        url: "http://localhost:4040/admin/userclientmap/",
        headers: headers,
        method: "POST",
        body: JSON.stringify(body)
      }
      request(options, function(error, response, body) {
        if (error) {
          console.log(error);
          res.send("Some error occured");
        } else {
          res.render("mapuserclientstatus.jade", {
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

http.createServer(app).listen(app.get('port'), function(req, res) {
  console.log('Listing to port 80');
});