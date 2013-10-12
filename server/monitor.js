var _ = require('underscore');

var monitor = function(config, resultsFileName, persistedRresults) {

    var results = persistedRresults || {};

    var smtpTransport; // SMTP transport in 'global' because it need to be closed on exit

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

        if (config.server.smtp) {
            var nodemailer = require("nodemailer");
            smtpTransport = nodemailer.createTransport("SMTP", config.server.smtp);
        }

        app.configure(function() {
            app.use(express.compress());
            app.use(express.static( __dirname+'/../www'));
            app.use(express.logger());
            app.use(app.router);
        });
        app.listen(config.server.port);
        app.get('/api/uptimes', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        });
        app.get('/api/config', function(req, res) {
            res.setHeader('content-type', 'application/json');
            res.send(_.omit(config, 'server'));
        });

        console.log('Monitor server listening on '+config.server.port);


        var monitorServer = function(target) {
            var shouldDoReq = true;
            if (config.common.startAt && config.common.stopAt) {
                var hour = new Date().getHours();
                shouldDoReq = hour >= config.common.startAt && hour < config.common.stopAt;
            }
            if (shouldDoReq) {
                httpRequestor(target.name, target.url, checkServer);
            }
            setTimeout(monitorServer.bind(this, target), config.common.checkInterval * 1000);
        };

        var checkServer = function(name, url, statusCode, size) {
            console.log('Response from', url, statusCode);
            var status = statusCode;
            if (statusCode === 200 && size === 0) { // Check response size
                status = 'empty';
            }
            var d = new Date();
            var result = { 'timestamp': d.getTime(), 'status': status };
            if (config.server.debug) {
                result.date = d.toString();
            }
            results[name].results.push(result);
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
                var from = new Date().getTime() - (config.server.emailInterval*1000);
                var status = hasBeenUp(target.results, from, config.common.flapping);
                console.log(key, 'was', (status ? 'UP' : 'DOWN'), 'during last', (config.server.emailInterval/60).toFixed(0), 'minutes');
                if (status === false && smtpTransport && config.server.emailfrom && config.server.emailto) {
                    var msg = "✘ " + target.url + " is down";
                    var mailOptions = {
                        from: config.server.emailfrom,
                        to: config.server.emailto,
                        subject: msg,
                        text: msg,
                        html: "<b>"+msg+"</b>"
                    };

                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                        }else{
                            console.log("Alert email sent : " + response.message);
                        }
                    });
                }
            });
        };
        if (config.server.emailInterval) {
            setInterval(checkIfHasBeenUp, config.server.emailInterval*1000);
        }

        var dayInMs = 24 * 60 * 60 * 1000;
        var daysToShowInMs = config.common.daysToShow * dayInMs;

        setInterval(function() {
            var from = new Date().getTime() - daysToShowInMs;
            cleanupResults(results, from);
        }, daysToShowInMs);
    };

    var saveAndQuit = function() {
        if (smtpTransport) {
            smtpTransport.close(); // shut down the connection pool, no more messages
        }
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
