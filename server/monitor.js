var _ = require('underscore');

var monitor = function(config, resultsFileName, persistedRresults) {

    var results = persistedRresults || {};

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

        app.configure(function() {
            app.use(express.static( __dirname+'/../www'));
            app.use(function(req, res, next){
                console.log('< %s %s', req.method, req.url); // Logging all incoming request
                next();
            });
            app.use(app.router);
        });
        app.listen(config.server.port);
        app.get('/api/uptimes', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        });
        app.get('/api/config', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(config);
        });

        console.log('Monitor server listening on '+config.server.port);


        var monitorServer = function(target) {
            var shouldDoReq = true;
            if (config.server.startAt && config.server.stopAt) {
                var hour = new Date().getHours();
                shouldDoReq = hour > config.server.startAt && hour < config.server.stopAt;
            }
            if (shouldDoReq) {
                httpRequestor(target.name, target.url, checkServer);
            }
            setTimeout(monitorServer.bind(this, target), config.server.checkInterval);
        };

        var checkServer = function(name, url, statusCode, size) {
            console.log('Response from', url, statusCode);
            var status = statusCode;
            if (statusCode === 200 && size === 0) { // Check response size
                status = 'empty';
            }
            results[name].results.push({ 'timestamp': new Date().getTime(), 'status': status });
        };

        config.targets.forEach(function(target) {
            console.log('Monitoring', target.name, 'on', target.url);
            if (!results[target.name] || !results[target.name].url|| !results[target.name].results) {
                results[target.name] = { 'url': target.url, 'results': [] };
            }
            monitorServer(target);
        });

        var checkIfHasBeenUp = function() {
            _.each(results, function(target, key) {
                var from = new Date().getTime() - config.server.emailInterval;
                var status = hasBeenUp(target.results, from, config.server.flapping);
                console.log(key, 'was', (status ? 'UP' : 'DOWN'), 'during last', (config.server.emailInterval/60000).toFixed(0), 'minutes');
                if (status === false) {
                    console.log(key, 'was DOWN !');
                    // TODO : send an email (or SMS ?)
                }
            });
        };
        setInterval(checkIfHasBeenUp, config.server.emailInterval);

        setInterval(function() {
            var from = new Date().getTime() - config.server.keepTime;
            cleanupResults(results, from);
        }, config.server.keepTime);
    };

    var saveAndQuit = function() {
        var fs = require('fs');
        fs.writeFile(resultsFileName, JSON.stringify(results), function (err) {
            if (err) { 
                console.log('Error while persisting results :', err);
            } else {
                console.log('Results persisted on disk');
            }
            process.exit();
        });
    };

    return {
        'launch': launch,
        'hasBeenUp': hasBeenUp,
        'cleanupResults': cleanupResults,
        'saveAndQuit': saveAndQuit
    };
};

module.exports = monitor;
