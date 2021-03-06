var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
  //console.log(lines);
    var sendData = {
    "metadata": {
        "reportname": "NMAP Cipher scan report",
        "scanid": data.scanID,
        "target": host,
        "toolname": "nmap cipher scan",
        "tooltype": "cipher scanning tool",
        "info": "Cipher scanning tool"
    },
    "reportdata": []
  }
  var cipherStr = "";
  var repData = {};
  for(var i=0;i<lines.length;i++) { 
    var dataExtract = lines[i].match(/\|\s{3}([\w\.]+)\:/i);
    if(dataExtract != null){
      cipherStr = "";
      repData = {};
      repData.label = dataExtract[1];
    }
    var ciphers = lines[i].match(/\|\s{7}([\w\_]+)\s\-\s(strong|weak)/i);
    if(ciphers != null){
      cipherStr = cipherStr + ciphers[1] + "   :   " + ciphers[2] + "<br>"
    }
    if(lines[i].match("compressors")){
      repData.desc = cipherStr;
      i++;
      var compressor = lines[i].match(/\|\s{7}(\w+)/i);
      repData.reportdata = compressor[1];
      sendData.reportdata.push(repData); 
    }
  } 
  callback(sendData);
}

//TESTING
/*
data = {
    "scanID" : "22",
    "toolNPM" : "nmapCipherDriver",
    "data" : [ 
        {
            "input" : "www.test.com",
            "output" : "\nStarting Nmap 6.40 ( http://nmap.org ) at 2015-03-17 22:50 IST\nNmap scan report for www.cybersecurist.com (162.251.84.214)\nHost is up (0.25s latency).\nPORT    STATE SERVICE\n443/tcp open  https\n| ssl-enum-ciphers: \n|   SSLv3: \n|     ciphers: \n|       TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_SEED_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_RSA_WITH_IDEA_CBC_SHA - weak\n|       TLS_RSA_WITH_RC4_128_MD5 - strong\n|       TLS_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_SEED_CBC_SHA - strong\n|     compressors: \n|       NULL\n|   TLSv1.0: \n|     ciphers: \n|       TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_SEED_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_RSA_WITH_IDEA_CBC_SHA - weak\n|       TLS_RSA_WITH_RC4_128_MD5 - strong\n|       TLS_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_SEED_CBC_SHA - strong\n|     compressors: \n|       NULL\n|   TLSv1.1: \n|     ciphers: \n|       TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_SEED_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_RSA_WITH_IDEA_CBC_SHA - weak\n|       TLS_RSA_WITH_RC4_128_MD5 - strong\n|       TLS_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_SEED_CBC_SHA - strong\n|     compressors: \n|       NULL\n|   TLSv1.2: \n|     ciphers: \n|       TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 - strong\n|       TLS_DHE_RSA_WITH_AES_128_GCM_SHA256 - strong\n|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_AES_256_CBC_SHA256 - strong\n|       TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_DHE_RSA_WITH_SEED_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 - strong\n|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 - strong\n|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 - strong\n|       TLS_ECDHE_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_128_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_128_CBC_SHA256 - strong\n|       TLS_RSA_WITH_AES_128_GCM_SHA256 - strong\n|       TLS_RSA_WITH_AES_256_CBC_SHA - strong\n|       TLS_RSA_WITH_AES_256_CBC_SHA256 - strong\n|       TLS_RSA_WITH_AES_256_GCM_SHA384 - strong\n|       TLS_RSA_WITH_CAMELLIA_128_CBC_SHA - strong\n|       TLS_RSA_WITH_CAMELLIA_256_CBC_SHA - strong\n|       TLS_RSA_WITH_IDEA_CBC_SHA - weak\n|       TLS_RSA_WITH_RC4_128_MD5 - strong\n|       TLS_RSA_WITH_RC4_128_SHA - strong\n|       TLS_RSA_WITH_SEED_CBC_SHA - strong\n|     compressors: \n|       NULL\n|_  least strength: weak\n\nNmap done: 1 IP address (1 host up) scanned in 23.57 seconds\n",
            "message" : "nmap scan result"
        }
    ],
    "_id" : "5508626304bd40200b483441",
    "clientID" : "303"
}

parse(data, function(retData){
  console.log(retData);
});
*/
//END TESTING

exports.parse = parse; 
