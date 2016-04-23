var parse = function(data, callback){
  var host = data.data[0].input;
  var lines = data.data[0].output.split('\n');
 console.log("################################Parsing File");
 console.log("All Lines splited ########");
 //console.log("All Lines split:" + lines);
    var sendData = {
    "metadata": {
        "reportname": "Roudra Security Automation Framework Arachni XSS Report",
        "scanid": data.scanID,
        "target": host,
        "toolname": "Arachni XSS",
        "tooltype": "XSS detection and scanning tool",
        "info": "XSS detection and scanning tool"
    },
    "reportdata": []
  }
 var index = 0;
 var raw_url;
 var only_url;
 var data;
  for(var i=0;i<lines.length;i++) {
    var repData = {};
    
    if(lines[i].match("XSS in path:")){
      index = index + 1;  
      repData.label = index;
      raw_url = lines[i].split(' ');
      for(var j=0;j<raw_url.length;j++) {
      	 if(j == 8){
         only_url = raw_url[j];
         }
      }      
      repData.desc = only_url;
      repData.reportdata = " ";
      sendData.reportdata.push(repData); 
    }


    if(lines[i].match(" 0 issues were detected")) {
      console.log("############################################ 0 Issues Found ");
      repData = {};
      repData.label = "No XSS vulnerability found";
      repData.desc = "XSS was not found in x_Path Target";
      sendData.reportdata.push(repData); 
    } else {

/*
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
    }*/
    } //else completed for no data found
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
            "output" : "Arachni - Web Application Security Scanner Framework v1.3.2
   Author: Tasos "Zapotek" Laskos <tasos.laskos@arachni-scanner.com>

           (With the support of the community and the Arachni Team.)

   Website:       http://arachni-scanner.com
   Documentation: http://arachni-scanner.com/wiki


 [+] XSS in path: In path with action http://www.israpost.com/Community/articles/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/Community/articles/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] XSS in path: In path with action http://www.israpost.com/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] XSS in path: In path with action http://www.israpost.com/style/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/Community/articles/Community/articles/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/user/iPad/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/user/iPad/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] XSS in path: In path with action http://www.israpost.com/user/iPhone/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/user/iPhone/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] XSS in path: In path with action http://www.israpost.com/inc/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/style/jqueryThemes/smoothness/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/HomePage/Tabs/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/HomePage/Tabs/Notables/Fillers/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] XSS in path: In path with action http://www.israpost.com/HomePage/Tabs/Gallery/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Notables/Banners/3_LBanners.php [Timeout was reached]
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Video/Video_Home.php [Timeout was reached]
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Articles/Articles_FrontX3.php [Timeout was reached]
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Articles/Articles_FrontX4.php [Timeout was reached]
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Articles/Front_newest_scroll.php [Timeout was reached]
 [-] Retrying for: http://www.israpost.com/HomePage/Tabs/Happening/Happenings_Front.php [Timeout was reached]
 [+] XSS in path: In path with action http://www.israpost.com/Menu_Builder/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E


























================================================================================


 [+] Web Application Security Report - Arachni Framework

 [~] Report generated on: 2016-03-18 15:40:40 +0530
 [~] Report false positives at: http://github.com/Arachni/arachni/issues

 [+] System settings:
 [~] ---------------
 [~] Version:           1.3.2
 [~] Audit started on:  2016-03-18 15:38:27 +0530
 [~] Audit finished on: 2016-03-18 15:40:40 +0530
 [~] Runtime:           00:02:13

 [~] URL:        http://www.israpost.com/Community/articles/show.php?articleID=21994
 [~] User agent: Arachni/v1.3.2

 [*] Audited elements: 
 [~] * Links
 [~] * Forms
 [~] * Cookies
 [~] * XMLs
 [~] * JSONs
 [~] * UI inputs
 [~] * UI forms

 [*] Checks: xss_path

 [~] ===========================

 [+] 17 issues were detected.

 [+] [1] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     3298914437
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/Menu_Builder/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/Menu_Builder/Members.php

 [~] Affected page:  http://www.israpost.com/Menu_Builder/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /Menu_Builder/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [2] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     2687474516
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/HomePage/Tabs/Gallery/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/HomePage/Tabs/Gallery/Gallery_Front.php

 [~] Affected page:  http://www.israpost.com/HomePage/Tabs/Gallery/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /HomePage/Tabs/Gallery/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [3] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     750087183
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/HomePage/Tabs/Notables/Fillers/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/HomePage/Tabs/Notables/Fillers/Filler200X40.php

 [~] Affected page:  http://www.israpost.com/HomePage/Tabs/Notables/Fillers/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /HomePage/Tabs/Notables/Fillers/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [4] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     3188795582
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/HomePage/Tabs/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/HomePage/Tabs/tab0.php

 [~] Affected page:  http://www.israpost.com/HomePage/Tabs/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /HomePage/Tabs/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [5] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     2457836083
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/style/jqueryThemes/smoothness/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/style/jqueryThemes/smoothness/jquery-ui.css

 [~] Affected page:  http://www.israpost.com/style/jqueryThemes/smoothness/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /style/jqueryThemes/smoothness/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [6] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     2860726754
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/inc/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/inc/jquery-ui.css

 [~] Affected page:  http://www.israpost.com/inc/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /inc/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [7] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     3241717458
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/user/iPhone/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/user/iPhone/index.php

 [~] Affected page:  http://www.israpost.com/user/iPhone/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] HTTP request
GET /user/iPhone/?%3E%22%27%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6%2F%3E= HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [8] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     317488963
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/user/iPhone/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/user/iPhone/index.php

 [~] Affected page:  http://www.israpost.com/user/iPhone/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /user/iPhone/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [9] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     2287597364
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/user/iPad/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/user/iPad/index.php

 [~] Affected page:  http://www.israpost.com/user/iPad/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] HTTP request
GET /user/iPad/?%3E%22%27%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6%2F%3E= HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [10] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     91167086
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/user/iPad/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/user/iPad/index.php

 [~] Affected page:  http://www.israpost.com/user/iPad/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /user/iPad/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [11] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     1003687892
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/include/AC_RunActiveContent.js

 [~] Affected page:  http://www.israpost.com/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [12] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     1919196473
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/Community/articles/Community/articles/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/Community/articles/Community/articles/include/comments.php??articleID=21994&comment_id=243810',280,600,'commets',1

 [~] Affected page:  http://www.israpost.com/Community/articles/Community/articles/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /Community/articles/Community/articles/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [13] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     926195690
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/style/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/style/arial-10.css

 [~] Affected page:  http://www.israpost.com/style/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /style/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [14] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     1242619602
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/redirect.php?action=banner&goto=38269

 [~] Affected page:  http://www.israpost.com/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] HTTP request
GET /?%3E%22%27%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6%2F%3E= HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [15] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     172819028
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/redirect.php?action=banner&goto=38269

 [~] Affected page:  http://www.israpost.com/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f;SiteLang[lang]=heb;SiteLang[DefaultSiteLang]=heb;Ad[Ad]=0



 [+] [16] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     288088821
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/Community/articles/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/Community/articles/show.php?articleID=21994

 [~] Affected page:  http://www.israpost.com/Community/articles/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [~] HTTP request
GET /Community/articles/?%3E%22%27%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6%2F%3E= HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f



 [+] [17] Cross-Site Scripting (XSS) in path (Trusted)
 [~] ~~~~~~~~~~~~~~~~~~~~
 [~] Digest:     3321771731
 [~] Severity:   High
 [~] Description: 
 [~] 
Client-side scripts are used extensively by modern web applications.
They perform from simple functions (such as the formatting of text) up to full
manipulation of client-side data and Operating System interaction.

Cross Site Scripting (XSS) allows clients to inject scripts into a request and
have the server return the script to the client in the response. This occurs
because the application is taking untrusted data (in this example, from the client)
and reusing it without performing any validation or sanitisation.

If the injected script is returned immediately this is known as reflected XSS.
If the injected script is stored by the server and returned to any client visiting
the affected page, then this is known as persistent XSS (also stored XSS).

Arachni has discovered that it is possible to insert script content directly into
the requested PATH and have it returned in the server's response.
For example `HTTP://yoursite.com/INJECTION_HERE/`, where `INJECTION_HERE`
represents the location where the Arachni payload was injected.

 [~] Tags: xss, path, injection, regexp

 [~] CWE: http://cwe.mitre.org/data/definitions/79.html
 [~] References:
 [~]   ha.ckers - http://ha.ckers.org/xss.html
 [~]   Secunia - http://secunia.com/advisories/9716/

 [~] URL:        http://www.israpost.com/Community/articles/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] Element:    path

 [~] Proof:     "<my_tag_d8fb00229c9cf52faf4468a7f9200fd6/>"

 [~] Referring page: http://www.israpost.com/Community/articles/show.php?articleID=21994

 [~] Affected page:  http://www.israpost.com/Community/articles/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [~] HTTP request
GET /Community/articles/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E HTTP/1.1
Host: www.israpost.com
Accept-Encoding: gzip, deflate
User-Agent: Arachni/v1.3.2
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*;q=0.8
Cookie: PHPSESSID=d31cc4d2d913d79b9475fe00429d337f




 [+] Plugin data:
 [~] ---------------


 [*] Health map
 [~] ~~~~~~~~~~~~~~
 [~] Description: Generates a simple list of safe/unsafe URLs.

 [~] Legend:
 [+] No issues
 [-] Has issues

 [+] http://www.israpost.com/
 [-] http://www.israpost.com/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] http://www.israpost.com/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [-] http://www.israpost.com/Community/articles/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] http://www.israpost.com/Community/articles/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [-] http://www.israpost.com/Community/articles/Community/articles/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/Community/articles/Community/articles/include/comments.php
 [+] http://www.israpost.com/Community/articles/Pop_View_Reporter_Home.php
 [+] http://www.israpost.com/Community/articles/Popindex.php
 [+] http://www.israpost.com/Community/articles/comment.php
 [+] http://www.israpost.com/Community/articles/print.php
 [+] http://www.israpost.com/Community/articles/show.php
 [-] http://www.israpost.com/HomePage/Tabs/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] http://www.israpost.com/HomePage/Tabs/Gallery/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/HomePage/Tabs/Gallery/Gallery_Front.php
 [-] http://www.israpost.com/HomePage/Tabs/Notables/Fillers/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/HomePage/Tabs/Notables/Fillers/Filler200X40.php
 [+] http://www.israpost.com/HomePage/Tabs/tab0.php
 [-] http://www.israpost.com/Menu_Builder/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/Menu_Builder/Members.php
 [-] http://www.israpost.com/inc/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/inc/Navbar.v2.js
 [+] http://www.israpost.com/inc/Top1.php
 [+] http://www.israpost.com/inc/ajax.js
 [+] http://www.israpost.com/inc/jquery-latest.js
 [+] http://www.israpost.com/inc/jquery-ui.css
 [+] http://www.israpost.com/inc/jquery-ui.js
 [+] http://www.israpost.com/inc/jquery.israpost.js
 [+] http://www.israpost.com/inc/js.js
 [-] http://www.israpost.com/include/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/include/AC_RunActiveContent.js
 [+] http://www.israpost.com/include/BusinessCard.php
 [+] http://www.israpost.com/include/sideAds_full_response.php
 [+] http://www.israpost.com/index.php
 [+] http://www.israpost.com/redirect.php
 [-] http://www.israpost.com/style/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/style/arial-10.css
 [+] http://www.israpost.com/style/general.js
 [-] http://www.israpost.com/style/jqueryThemes/smoothness/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [+] http://www.israpost.com/style/jqueryThemes/smoothness/jquery-ui.css
 [-] http://www.israpost.com/user/iPad/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] http://www.israpost.com/user/iPad/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] http://www.israpost.com/user/iPad/index.php
 [-] http://www.israpost.com/user/iPhone/%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E
 [-] http://www.israpost.com/user/iPhone/?%3E%22'%3E%3Cmy_tag_d8fb00229c9cf52faf4468a7f9200fd6/%3E=
 [+] http://www.israpost.com/user/iPhone/index.php

 [~] Total: 46
 [+] Without issues: 29
 [-] With issues: 17 ( 37% )

 [~] Report saved at: /root/www.israpost.com 2016-03-18 15_40_40 +0530.afr [0.09MB]

 [~] Audited 50 pages.
 [~] Audit limited to a max of 50 pages.

 [~] Duration: 00:02:13
 [~] Processed 202/202 HTTP requests.
 [~] -- 1.549 requests/second.
 [~] Processed 0/0 browser jobs.
 [~] -- NaN second/job.

 [~] Currently auditing          http://www.israpost.com/Menu_Builder/Members.php
 [~] Burst response time sum     18.194 seconds
 [~] Burst response count        6
 [~] Burst average response time 3.032 seconds
 [~] Burst average               0.599 requests/second
 [~] Timed-out requests          33
 [~] Original max concurrency    20
 [~] Throttled max concurrency   15",
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
