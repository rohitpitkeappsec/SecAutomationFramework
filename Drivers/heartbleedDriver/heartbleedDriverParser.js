var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
  //console.log(lines);
    var sendData = {
    "metadata": {
        "reportname": "Heartbleed Scan Result",
        "scanid": data.scanID,
        "target": host,
        "toolname": "HeartBleed Scan ",
        "tooltype": "Heartbleed scanning tool",
        "info": "Heartbleed scanning tool"
    },
    "reportdata": []
  }
  var cipherStr = "";
  var repData = {};
  for(var i=0;i<lines.length;i++) {
    if((lines[i].match("No heartbeat response received") != null) || (lines[i].match("No TLS versions supported") != null)){
      repData = {};
      repData.label = "No heartbleed vulnerability found";
      repData.desc = "Heartbleed was not found as heartbleed response was not received";
      sendData.reportdata.push(repData); 
    } else if(lines[i].match("server is vulnerable") != null){
      repData = {};
      repData.label = "Heartbleed vulnerability found";
      repData.desc = "Target Vulnerable for HeartBleed Attack";
      sendData.reportdata.push(repData); 
    }
  }
  
  callback(sendData);
}

exports.parse = parse; 
