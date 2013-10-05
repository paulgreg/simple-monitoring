var _ = require('underscore');

var monitor = function(config) {

    var launch = function() {
        var httpRequestor = require('./httpRequestor.js');
        var express = require('express');
        var app = express();
        var results = {};

        app.configure(function() {
            app.use(app.router);
            app.use(express.static( __dirname+'/../www'));
        });
        app.listen(config.server.port);
        app.get('/api/uptimes', function(req, res) {
            console.log('Serving', req.route.path);
            res.setHeader('content-type', 'application/json');
            res.send(results);
        });

        console.log('Monitor server listening on '+config.server.port);


        var monitorServer = function(target) {
            httpRequestor(target.url, checkServer);
            setTimeout(monitorServer.bind(this, target), config.server.checkInterval);
        };

        var checkServer = function(url, statusCode, response) {
            console.log('Response from', url, statusCode);
            results[url].push({ 'timestamp': new Date().getTime(), 'status': statusCode });
        };

        config.targets.forEach(function(target) {
            console.log('Monitoring', target.name, 'on', target.url);
            results[target.url] = [];
            monitorServer(target);
        });

        var checkIfHasBeenUp = function() {
            _.each(results, function(result, key) {
                var from = new Date().getTime() - config.server.emailInterval;
                var status = hasBeenUp(result, from, config.server.flapping);
                console.log(key, 'was', (status ? 'up' : 'DOWN'), 'during last', (config.server.emailInterval/60000).toFixed(0), 'minutes');
                if (status === false) {
                    console.log(key, 'was DOWN !');
                }
            });
        };

        setInterval(checkIfHasBeenUp, config.server.emailInterval);
    };

    var hasBeenUp = function(values, from, maxfails) {
        var filteredList = _.filter(values, function(item) {
            return item.timestamp > from;
        });
        var fails = 0;
        for (var i in filteredList) {
            var item = filteredList[i];
            fails = (item.status !== 200) ? ++fails : 0;
            if (fails > maxfails) {
                return false;
            }
        }
        return true;
    };

    return {
        'launch': launch,
        'hasBeenUp': hasBeenUp
    };
};

module.exports = monitor;
