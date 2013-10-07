var httpRequestor = function(name, url, callback) {

    if (!url) {
        console.log('Bad httpRequestor configuration');
    }

    var u = require('url').parse(url);

    var requestor = (u.protocol === 'http:') ? http = require("http") : https = require("https");
    var port = (u.protocol === 'http:') ? 80 : 443;

    var options = { 'host': u.hostname, 'port': port, 'path': u.path, method: 'GET'};
    //if (config.username && config.password) { options.auth = config.username+':'+config.password; }
    requestor.request(options, function(res) {
        var size= 0;
        res.on('data', function(chunk) {
            size += chunk.length;
        }).on('end', function() {
            callback(name, url, res.statusCode, size);
        });
    }).on('error', function(err) {
        callback(name, url, 500, 0);
    }).end();
};

module.exports = httpRequestor;
