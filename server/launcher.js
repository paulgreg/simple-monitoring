var fs = require('fs');
var _ = require('underscore');

fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { 
        return console.log('No config file found :', err);
    }

    try {
        var config = JSON.parse(data);

        _.each(config.targets, function(target) {
            target.name = target.name.replace(/[^\w]/g, '-'); // Replace unsafe characters by dashes
        });

        var monitor = require('./monitor')(config);
        monitor.launch();
    } catch(e) {
        console.log('Error while parsing configuration or during monitoring', e);
    }
});

