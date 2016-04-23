var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
 console.log("################################Parsing File");
 console.log("All Lines splited ########");
// console.log("All Lines split:" + lines);
    var sendData = {
    "metadata": {
        "reportname": "Arachni OS Command Injection Report",
        "scanid": data.scanID,
        "target": host,
        "toolname": "Arachni OS Command  Injection",
        "tooltype": "OS Command Injection and scanning tool",
        "info": "OS Command Injection and scanning tool"
    },
    "reportdata": []
  }

 var index = 0;
 var raw_url;
 var only_url;
 var data;
  for(var i=0;i<lines.length;i++) {
    var repData = {};

    if(lines[i].match(" 0 issues were detected")) {
      console.log("############################################ 0 Issues Found ");
      repData = {};
      repData.label = "No OS Command Injection vulnerability found";
      repData.desc = "NO Data";
      sendData.reportdata.push(repData); 
    } 


    if(lines[i].match("Affected page:")){
      index = index + 1;  
      repData.label = index;
      repData.desc = lines[i]; 
      repData.reportdata = " ";;
      sendData.reportdata.push(repData); 
    }
    
  } 
  callback(sendData);
}

//TESTING
/*
data = {
    "scanID" : "19",
    "data" : [ 
        {
            "input" : "http://www.israpost.com/Community/articles/show.php?articleID=21994",
            "output" : "Arachni - Web Application Security Scanner Framework v1.3.2",
            "message" : "nmap scan result"
        }
    ],
    "_id" : "54ff080038a157ac1bacb496",
    "clientID" : "303"
}

parse(data, function(retData){
  console.log(retData);
});
*/
//END TESTING

exports.parse = parse; 
