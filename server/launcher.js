var fs = require('fs');
var _ = require('underscore');

var RESULTS_FILENAME = 'persisted-results.json';

fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { 
        return console.log('No config file found :', err);
    }

    try {
        var config = JSON.parse(data);

        _.each(config.targets, function(target) {
            target.name = target.name.replace(/[^\w]/g, '-'); // Replace unsafe characters by dashes
        });

        var results = {};

        fs.readFile(RESULTS_FILENAME, 'utf8', function (err, data) {
            if (!err) { 
                results = JSON.parse(data);
            }

            var monitor = require('./monitor')(config, RESULTS_FILENAME, results);
            monitor.launch();

            process.stdin.resume(); //so the program will not close instantly
            process.on('SIGINT', function () {
                monitor.saveAndQuit();
            });
        });

    } catch(e) {
        console.log('Error while parsing configuration or during monitoring', e);
    }
});

