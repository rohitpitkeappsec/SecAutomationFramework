var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
// console.log("All Lines split:" + lines);
    var sendData = {
    "metadata": {
        "reportname": "Roudra Security Automation Framework Nikto Misconfiguration Report",
        "scanid": data.scanID,
        "target": host,
        "toolname": "Nikto Misconfiguration Detection",
        "tooltype": "Nikto Misconfiguration and scanning tool",
        "info": "Nikto Misconfiguration and scanning tool"
    },
    "reportdata": []
  }
 var index = 0;
 var raw_url;
 var only_url;
 var data;
  for(var i=0;i<lines.length;i++) {
    var repData = {};

    if(lines[i].match("Multiple index files found")) {  // detect index files
      repData = {};
      index = index + 1;  
      repData.label = index;   
      raw_url = lines[i].split(':');
      for(var j=0;j<raw_url.length;j++) {
      	 if(j == 1){
         only_url = raw_url[j];
         }
      } // for completed
      repData.desc = only_url;
      repData.reportdata = "Multiple index files found";
      sendData.reportdata.push(repData); 
    } 

    if(lines[i].match("appears to be outdated")) {  // detect outdated protocal
      repData = {};
      index = index + 1;  
      repData.label = index;
      raw_url = lines[i].split('+');
      for(var j=0;j<raw_url.length;j++) {
      	 if(j == 1){
         only_url = raw_url[j];
         }
      } // for completed
      repData.desc = only_url;
      repData.reportdata = "Protocal Version may outdated";
      sendData.reportdata.push(repData); 
    } 
    
    if(lines[i].match("host is vulnerable")) {  // detect host is vulnerable
      repData = {};
      index = index + 1;  
      repData.label = index;
      raw_url = lines[i].split(':');
      for(var j=0;j<raw_url.length;j++) {
      	 if(j == 1){
         only_url = raw_url[j];
         }
      } // for completed
      repData.desc = only_url; 
      repData.reportdata = "Suggesting host is Vulnerable";
      sendData.reportdata.push(repData); 
    } 

    if(lines[i].match("are vulnerable to")){
      repData = {};
      index = index + 1;  
      repData.label = index;
      raw_url = lines[i].split(' ');
      for(var j=0;j<raw_url.length;j++) {
      	 if(j == 4){
         only_url = raw_url[j];
         }
      } // for completed
      repData.desc = only_url; 
      repData.reportdata = "Suggesting Vulnerability Found";
      sendData.reportdata.push(repData); 
    } // if completed
    
  } // main for loop completed
  callback(sendData);
}

//TESTING
/* // not original raw data
{
    "_id" : ObjectId("570fc6f7f7725dd623f01586"),
    "clientID" : "448",
    "data" : [ 
        {
            "input" : "http://www.bible-history.com",
            "output" : "- Nikto v2.1.6\n---------------------------------------------------------------------------\n
+ Target IP:          54.201.8.54\n
+ Target Hostname:    www.bible-history.com\n
+ Target Port:        80\n
+ Start Time:         2016-04-14 12:36:19 (GMT-4)\n
---------------------------------------------------------------------------\n
+ Server: Apache/2.4.18 (Amazon) PHP/5.5.31\n
+ Retrieved x-powered-by header: PHP/5.5.31\n
+ The anti-clickjacking X-Frame-Options header is not present.\n
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS\n
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type\n
+ Server leaks inodes via ETags, header found with file /robots.txt, fields: 0x36 0x4de57ece82340 \n
+ Entry '/books/about/' in robots.txt returned a non-forbidden or redirect HTTP code (200)\n
+ \"robots.txt\" contains 1 entry which should be manually viewed.\n
+ Multiple index files found: /index.html, /index.php, /index.htm\n
+ PHP/5.5.31 appears to be outdated (current is at least 5.6.9). PHP 5.5.25 and 5.4.41 are also current.\n
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives.\n+ 432 requests: 0 error(s) and 10 item(s) reported on remote host\n
+ End Time:           2016-04-14 12:39:46 (GMT-4) (207 seconds)\n
---------------------------------------------------------------------------\n
+ 1 host(s) tested\n\n\n      *********************************************************************\n     
 Portions of the server's headers (Apache/2.4.18) are not in\n      
the Nikto database or are newer than the known string. Would you like\n      
to submit this information (*no server specific data*) to CIRT.net\n      
for a Nikto update (or you may email to sullo@cirt.net) (y/n)? \n",
            "message" : "Nikto Misconfiguraion Scan Result"
        }
    ],
    "date" : "Thu Apr 14 2016 12:36:07 GMT-0400 (EDT)",
    "scanID" : "1",
    "toolNPM" : "niktoMisconfDriver",
    "toolName" : "niktoMisconfDriver",
    "user" : "admin"
}
//END TESTING
*/

exports.parse = parse; 
