var parse = function(data, callback){
  var lines = data.data[0].output.split('\n');
  //console.log(lines);
    var sendData = {
    "metadata": {
        "reportname": "NMAP OS report",
        "scanid": data.scanID,
        "toolname": "nmap OS",
        "tooltype": "OS detection and scanning tool",
        "info": "OS detection and scanning tool"
    },
    "reportdata": []
  }
  for(var i=0;i<lines.length;i++) {
    var repData = {};
    if(lines[i].match("Running:")){
      repData.label = "Running OS";
      repData.desc = "Detected Running OS for this scan";
      repData.reportdata = lines[i];
      sendData.reportdata.push(repData); 
    }
    if(lines[i].match("OS CPE:")){
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
            "input" : "192.168.1.110",
            "output" : "\nStarting Nmap 6.40 ( http://nmap.org ) at 2015-03-10 20:33 IST\nNmap scan report for 192.168.1.110\nHost is up (0.0014s latency).\nNot shown: 986 closed ports\nPORT      STATE SERVICE\n135/tcp   open  msrpc\n139/tcp   open  netbios-ssn\n445/tcp   open  microsoft-ds\n554/tcp   open  rtsp\n902/tcp   open  iss-realsecure\n912/tcp   open  apex-mesh\n1025/tcp  open  NFS-or-IIS\n1026/tcp  open  LSA-or-nterm\n1027/tcp  open  IIS\n1029/tcp  open  ms-lsa\n1030/tcp  open  iad1\n1031/tcp  open  iad2\n2869/tcp  open  icslap\n10243/tcp open  unknown\nMAC Address: 70:F1:A1:F1:6E:73 (Liteon Technology)\nDevice type: general purpose\nRunning: Microsoft Windows Vista\nOS CPE: cpe:/o:microsoft:windows_vista\nOS details: Microsoft Windows Vista\nNetwork Distance: 1 hop\n\nOS detection performed. Please report any incorrect results at http://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 39.05 seconds\n",
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
