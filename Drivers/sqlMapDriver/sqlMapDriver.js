var fs = require('fs');
var path = require('path');
var file = 'sqlMapDriver.json';    //configuration file placed in the same directory
var cp = require("child_process");

var configPath = path.join(path.dirname(fs.realpathSync(__filename)), '/');

var getToolInfo = function (callback) {
  fs.readFile(configPath + file, 'utf8', function (err, Data)  {  //function for reading config file content 
    if (err){
      console.log('Error: ' + err);
      callback(err);
    }
    JSONData = JSON.parse(Data);    //parsing json data from config file
    delete JSONData.URL.commandOption;
    callback(JSONData);  
  });
}

var runTool = function (scanID, userJSONData, callback){
  fs.readFile(configPath + file, 'utf8', function (err, configJSONData){    //function for reading config file content 
    if (err){
      console.log('Error: ' + err);
      callback(err);
    }
   
    configJSONData = JSON.parse(configJSONData);    //parsing json data from config file
    console.log(userJSONData);
    var str=";";
    if(userJSONData.URL.value.indexOf(str) > -1 ||
       userJSONData.Verbose.value.indexOf(str) > -1 ||
       userJSONData.All.value.indexOf(str) > -1 )    //Checking for malicious data such as ';'
      callback("User input is Malicious");  
    else{    
      var sqlMapPath = configPath + "sqlmap/sqlmap.py";
      console.log(userJSONData.URL.value);
      var JSONinput =[], JSONoutput="", message = "";
      var data = [];
      JSONinput.push(userJSONData.URL.value);
      var command = "python " + sqlMapPath + " ";  
      /*if(userJSONData.All.value == "On"){
        JSONinput.push("All"); 
        command = command + configJSONData.All.commandOption + " ";  
      }*/
      if(userJSONData.Verbose.value != "1"){
        JSONinput.push("Verbose"); 
        command = command + configJSONData.Verbose.commandOption + " " + userJSONData.Verbose.value + " ";  
      }/* else {
        command = command + configJSONData.Verbose.commandOption + " ";
      } */
      command = command + configJSONData.URL.commandOption +" "+userJSONData.URL.value+" --batch --threads=10";
      console.log(command);
      cp.exec(command, function (err, stdout, stderr) {
        console.log(err);
        console.log(stdout);
        JSONoutput = stdout;
        message = "sqlmap scan result";
        var JSONData = {"input":JSONinput, "output":JSONoutput, "message":message};
        data.push(JSONData);
        var datasend = {"scanID":scanID,"toolNPM":"sqlMapDriver","data":data};
        console.log(datasend);
        callback(datasend);  
      });  
    }
  });
}

exports.getToolInfo = getToolInfo;        //Exports the getToolInfo function 
exports.runTool = runTool;          //Exports the runTool function 