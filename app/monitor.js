var _ = require('underscore');

var monitor = function(config) {

    var cleanupResults = function(data, from) {
        _.each(data, function(target, key) {
            var nbValues = target.results.length;
            var filteredList = _.filter(target.results, function(item) {
                return item.timestamp > from;
            });
            data[key].results = filteredList;
            console.log('Remove old results for', key, ':', nbValues, 'before, reduced to', filteredList.length, 'values');
        });
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
            httpRequestor(target.name, target.url, checkServer);
            setTimeout(monitorServer.bind(this, target), config.server.checkInterval);
        };

        var checkServer = function(name, url, statusCode, response) {
            console.log('Response from', url, statusCode);
            results[name].results.push({ 'timestamp': new Date().getTime(), 'status': statusCode });
        };

        config.targets.forEach(function(target) {
            console.log('Monitoring', target.name, 'on', target.url);
            results[target.name] = { 'url': target.url, 'results': [] };
            monitorServer(target);
        });

        var checkIfHasBeenUp = function() {
            _.each(results, function(target, key) {
                var from = new Date().getTime() - config.server.emailInterval;
                var status = hasBeenUp(target.results, from, config.server.flapping);
                console.log(key, 'was', (status ? 'up' : 'DOWN'), 'during last', (config.server.emailInterval/60000).toFixed(0), 'minutes');
                if (status === false) {
                    console.log(key, 'was DOWN !');
                }
            });
        };
        setInterval(checkIfHasBeenUp, config.server.emailInterval);

        setInterval(function() {
            var from = new Date().getTime() - config.server.keepTime;
            cleanupResults(results, from);
        }, config.server.keepTime);
    };

    return {
        'launch': launch,
        'hasBeenUp': hasBeenUp,
        'cleanupResults': cleanupResults
    };
};

module.exports = monitor;
