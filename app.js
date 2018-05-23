var localIpV4Address = require("local-ipv4-address");

localIpV4Address().then(function(ipAddress){
    console.log("My IP address is " + ipAddress);
    // My IP address is 10.4.4.137 
});