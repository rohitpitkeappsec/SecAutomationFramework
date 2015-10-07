/*
 * This is main update server file. Containing APIs to check 
 * lastest version of drivers and download them on server.
 * Detailed documentation of each REST API is given in ReadMe
 */
var express = require('express');
var http = require('http');
var Admzip = require('adm-zip');
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var db = require('./dbUtility.js');
var config = require('./config.json');
var upload = multer();

var app = express();

app.set('port', config.port);

app.use(bodyParser.json());

/*
 * This API is to upload latest version of the tool
 * to update server. API expects .zip file with form-data
 */
app.post('/uploadtool', upload.single('filename'), function(req, res) {
  fs.readFile(req.file.path, function(err, data) {
    var filename = req.file.originalname.split("/");
    var newPath = __dirname + "/tools/" + filename[filename.length - 1];
    fs.writeFile(newPath, data, function(err) {
      if (err) throw err;
      var zip = new Admzip(newPath);
      zip.extractAllTo( /*target path*/ "./tools/", /*overwrite*/ true);
      fs.unlink(req.file.path, function(err) {
        if (err) {
          console.log("error removing file");
          res.status(404).send({
            "status": "Fail"
          });
        } else {
          var packageFile = __dirname + "/tools/" + filename[filename.length - 1].split(".")[0] + "/package.json"
          fs.readFile(packageFile, 'utf8', function(err, data) {
            packageJSONData = JSON.parse(data);
            console.log(packageJSONData.version);
            toolData = {
              "toolID": filename[filename.length - 1].split(".")[0],
              "version": packageJSONData.version
            }
            db.updateToolInDB(toolData, function(status) {
              if (status == "ok") {
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
          });
        }
      });
    });
  });
});

/*
 * This API is to get latest version of tools
 */
app.get('/getversion', function(req, res) {
  db.getAllVersion(function(data) {
    if (data == "error") {
      console.log("error in toolID");
    } else {
      console.log(data);
      res.send(data);
    }
  });
});


/*
 * This API is to download driver zip file
 */
app.get('/getdriver/:toolID', function(req, res) {
  var filePath = path.join(__dirname + '/tools/', req.params.toolID + '.zip');
  var stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/zip'
  });
  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('server started on '+config.port);
});
