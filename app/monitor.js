var monitor = function(config) {

    var httpRequestor = require('./httpRequestor.js');
    var express = require('express');
    var app = express();
    var results = {};

    app.configure(function() {
        app.use(app.router);
        app.use(express.static( __dirname+'/../www'));
    });
    app.listen(config.server.port);
    app.get('/api/results', function(req, res) {
        console.log('Serving', req.route.path);
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });

    console.log('Monitor server listening on '+config.server.port);


    var monitorServer = function(target) {
        httpRequestor(target.url, checkServer);
    };

    var checkServer = function(url, statusCode, response) {
        console.log('Response for', url, statusCode);
        results[url][new Date().getTime()] = statusCode;
    };

    config.targets.forEach(function(target) {
        console.log('Monitoring', target.name, 'on', target.url);
        results[target.url] = {};
        setInterval(monitorServer.bind(this, target), config.server.interval);
    });
};


var fs = require('fs');                                                                                                                 
fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { return console.log('No config file found :', err); }
    monitor(JSON.parse(data));
});

