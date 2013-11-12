var httpRequestor = function(name, url, callback) {

    if (!url) {
        console.log('Bad httpRequestor configuration');
    }

    var u = require('url').parse(url);

    var requestor = (u.protocol === 'http:') ? http = require("http") : https = require("https");
    var port = (u.protocol === 'http:') ? 80 : 443;

    var ts = ((u.path.indexOf('?') >= 0) ? '&monitortimestamp=' : '?monitortimestamp=') + (+ new Date());
    var path = u.path+ts;
    
    var options = { 'host': u.hostname, 'port': port, 'path': path, method: 'GET'};

    console.log('Monitoring:'+JSON.stringify(options));

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
