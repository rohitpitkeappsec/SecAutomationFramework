var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
    var sendData = {
    "metadata": {
        "reportname": "Roudra Security Automation Framework Nikto File Vulnerability Report",
        "scanid": data.scanID,
        "target": host,
        "toolname": "Nikto File Vulnerability",
        "tooltype": "Nikto File Vulnerability and scanning tool",
        "info": "Nikto File Vulnerability and scanning tool"
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
    
    if(lines[i].match("security problem")) {  // detect host is vulnerable
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
      repData.reportdata = "Suggesting Security problem";
      sendData.reportdata.push(repData); 
    } 

    if(lines[i].match("contains a number of vulnerabilities")){
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
      repData.reportdata = "Suggesting Vulnerability Found";
      sendData.reportdata.push(repData); 
    } // if completed
    
  } // main for loop completed
  callback(sendData);
}

//TESTING
/* // not original raw data
{
    {
    "_id" : ObjectId("57176f563fa0fe3e08b24da2"),
    "clientID" : "448",
    "data" : [ 
        {
            "input" : "http://www.railfaneurope.net/pix/upload.php",
            "output" : "- Nikto v2.1.6\n---------------------------------------------------------------------------\n+ Target IP:          88.149.157.210\n+ Target Hostname:    www.railfaneurope.net\n
+ Target Port:        80\n
+ Start Time:         2016-04-20 08:00:33 (GMT-4)
\n---------------------------------------------------------------------------\n
+ Server: Apache/2.2.16 (Debian)\n
+ Retrieved x-powered-by header: PHP/5.3.3-7+squeeze19\n+ The anti-clickjacking X-Frame-Options header is not present.\n
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS\n
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type\n
+ No CGI Directories found (use '-C all' to force check all possible dirs)\n
+ lines\n
+ Server leaks inodes via ETags, header found with file /pix/upload.php<b>ed Extensions</b>: gif, jpg, png, txt.<br /></span></td>, inode: 0x21, size: 0x1dd, mtime: 0x3f9349dc9ddc0;530d732ec4480\n+ \"robots.txt\" contains 1 entry which should be manually viewed.\n+ Apache/2.2.16 appears to be outdated (current is at least Apache/2.4.12). Apache 2.0.65 (final release) and 2.2.29 are also current.\n
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS \n
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives.\n
+ /pix/upload.php/kboard/: KBoard Forum 0.3.0 and prior have a security problem in forum_edit_post.php, forum_post.php and forum_reply.php\n
+ /pix/upload.php/lists/admin/: PHPList pre 2.6.4 contains a number of vulnerabilities including remote administrative access, harvesting user info and more. Default login to admin interface is admin/phplist\n
+ /pix/upload.php/splashAdmin.php: Cobalt Qube 3 admin is running. This may have multiple security problems as described by www.scan-associates.net. These could not be tested remotely.\n
+ /pix/upload.php/ssdefs/: Siteseed pre 1.4.2 has 'major' security problems.\n
+ /pix/upload.php/sshome/: Siteseed pre 1.4.2 has 'major' security problems.\n
+ /pix/upload.php/tiki/: Tiki 1.7.2 and previous allowed restricted Wiki pages to be viewed via a 'URL trick'. Default login/pass could be admin/admin\n
+ /pix/upload.php/tiki/tiki-install.php: Tiki 1.7.2 and previous allowed restricted Wiki pages to be viewed via a 'URL trick'. Default login/pass could be admin/admin\n
+ /pix/upload.php/scripts/samples/details.idc: See RFP 9901; www.wiretrip.net\n+ 393 requests: 0 error(s) and 18 item(s) reported on remote host\n
+ End Time:           2016-04-20 08:01:38 (GMT-4) (65 seconds)\n
---------------------------------------------------------------------------\n+ 1 host(s) tested\n",
            "message" : "Nikto File Vulnerability Result"
        }
    ],
    "date" : "Wed Apr 20 2016 08:00:22 GMT-0400 (EDT)",
    "scanID" : "11",
    "toolNPM" : "niktoFileDriver",
    "toolName" : "niktoFileDriver",
    "user" : "admin"
}
*/

exports.parse = parse; 
