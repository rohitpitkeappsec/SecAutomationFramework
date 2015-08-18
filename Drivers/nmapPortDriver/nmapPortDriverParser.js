var parse = function(data, callback){
  var lines = data.data[0].output.split('\n');
  //console.log(lines);
    var sendData = {
    "metadata": {
        "reportname": "NMAP port scan report",
        "scanid": data.scanID,
        "toolname": "nmap port scan",
        "tooltype": "Port scanning tool",
        "info": "Port scanning tool"
    },
    "reportdata": []
  }
  for(var i=0;i<lines.length;i++) {
    var repData = {};
    var dataExtract = lines[i].match(/(\d+\/tcp|udp)\s+(open)\s+(\w+)/i);
    if(dataExtract != null){
      repData.label = dataExtract[1];
      repData.desc = dataExtract[2];
      repData.reportdata = dataExtract[3];
      sendData.reportdata.push(repData); 
    }
    /*if(lines[i].match("OS CPE:")){
      repData.label = "Common Platform Enumeration";
      repData.desc = "CPE indetified by tool";
      repData.reportdata = lines[i];
      sendData.reportdata.push(repData); 
    }
    if(lines[i].match("OS details:")){
      repData.label = "OS Details";
      repData.desc = "OS Details by identified by tool";
      repData.reportdata = lines[i];
      sendData.reportdata.push(repData); 
    }*/
  } 
  callback(sendData);
}

//TESTING
/*
data = {
    "scanID" : "20",
    "toolNPM" : "nmapPortDriver",
    "data" : [ 
        {
            "input" : "192.168.1.107",
            "output" : "\nStarting Nmap 6.40 ( http://nmap.org ) at 2015-03-16 21:57 IST\nNmap scan report for 192.168.1.107\nHost is up (0.0041s latency).\nNot shown: 981 filtered ports, 8 closed ports\nPORT      STATE SERVICE\n135/tcp   open  msrpc\n139/tcp   open  netbios-ssn\n445/tcp   open  microsoft-ds\n902/tcp   open  iss-realsecure\n912/tcp   open  apex-mesh\n5357/tcp  open  wsdapi\n49152/tcp open  unknown\n49153/tcp open  unknown\n49154/tcp open  unknown\n49155/tcp open  unknown\n49156/tcp open  unknown\nMAC Address: E8:2A:EA:9A:32:E7 (Intel Corporate)\n\nNmap done: 1 IP address (1 host up) scanned in 16.48 seconds\n",
            "message" : "nmap scan result"
        }
    ],
    "_id" : "5507048350e8b23160a9a46f",
    "clientID" : "303"
}

parse(data, function(retData){
  console.log(retData);
});
*/
//END TESTING

exports.parse = parse; 
