var parse = function(data, callback){
  var lines = data.data[0].output.split('\n');
  //console.log(lines);
  for(var i=0;i<lines.length;i++) {
    if(lines[i].match("Place")){
      JSONinput = "";
      JSONinput += lines[i] + " ";  
    }
    if(lines[i].match("Parameter")){
      JSONinput = "";
      JSONinput += lines[i] + " ";
    } 
    if (lines[i].match("Type")){
      message = lines[i];
    }
   
    if(lines[i].match("Title")){
      JSONoutput = lines[i] + " ";
    } else if(lines[i].match("Payload")){
      JSONoutput += lines[i];
      var JSONData = {"input":JSONinput, "output":JSONoutput, "message":message};
      console.log(JSONData);
      console.log(data);
      data.data.push(JSONData);
      JSONoutput = "";
      message = "";
    }
  }
  var sendData = {
    "metadata": {
        "reportname": "SQLMap report",
        "scanid": data.scanID,
        "toolname": "sqlmap",
        "tooltype": "SQL Injection scanning tool",
        "info": "SQL injection scanning tool"
    },
    "reportdata": []
  }
  for(var j=0; j<data.data.length; j++){
    var repData = {};
    if (j == 0){
      sendData.target = data.data[j].input;
      sendData.tooloutput = data.data[j].output;
    } else {
      repData.label = data.data[j].input;
      repData.desc = data.data[j].output;
      repData.reportdata = data.data[j].message;
      sendData.reportdata.push(repData);
    }
  }
  
  callback(sendData);
}

exports.parse = parse;