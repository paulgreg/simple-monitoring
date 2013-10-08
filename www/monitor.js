var Monitor = (function(undefined) {

    var buildTimeTable = function(config) {
        var daysToShow  = config.server.daysToShow;
        var startAt     = config.server.startAt ? config.server.startAt : 0;
        var stopAt      = config.server.stopAt  ? config.server.stopAt  : 23;
        var days = [];
        for(var i = 0; i < daysToShow; i++) {
            var hours = [];
            for(var h = startAt; h < stopAt; h++) {
                hours.push({ 'status': 'unknown', 'statusCodes': [] });
            }
            days.push({ 'hours': hours });
        }
        var table = { 'days': days, 'startAt': startAt, 'stopAt': stopAt };
        return table;
    };
    var fillTimeTable = function(config, now, timetable, uptime) {
        var day = 86400000; // 24 * 60 * 60 * 1000;
        _.each(uptime.results, function(result) {
            var ts = result.timestamp;
            var dayDiff = parseInt((now - ts) / day, 10);
            if (dayDiff < timetable.days.length) {
                var tsDate = new Date(ts);
                var hour = tsDate.getHours();
                var idxToRemove = (config.server.startAt) ? config.server.startAt : 0;
                var cell = timetable.days[dayDiff].hours[(hour-idxToRemove)];
                cell.statusCodes.push(result.status);
            }
        });
        _.each(timetable.days, function(day) {
            _.each(day.hours, function(hour) {
                if (hour.statusCodes.length > 0) {
                    var previousFails = 0;
                    var totalFails = 0;
                    var moreFailsThanFlapping = false;
                    for(var i = 0; i < hour.statusCodes.length; i++) {
                        if (hour.statusCodes[i] === 200) {
                            previousFails = 0;
                        } else {
                            totalFails++;
                            previousFails++;
                            if (previousFails >= config.server.flapping) {
                                moreFailsThanFlapping = true;
                            }
                        }
                    }
                    if (moreFailsThanFlapping === true) {
                        hour.status = 'down';
                    } else if (totalFails > 0) {
                        hour.status = 'instable';
                    } else {
                        hour.status = 'up';
                    }
                }
            });
        });
    };

    var config = null;

    try {
        var $tplTarget = $('#tpl-target');
        var tplTarget = _.template($tplTarget.text());
        var $tplTimetable = $('#tpl-timetable');
        var tplTimetable = _.template($tplTimetable.text());
    } catch(e) {}

    var renderTimetables = function(uptimes) {

        _.each(uptimes, _.bind(function(uptime, key) {
            var timetable = buildTimeTable(this.config);

            fillTimeTable(this.config, new Date().getTime(), timetable, uptime);

            var timetableHtml = tplTimetable(timetable);
            $('#'+key+' .timetable').html(timetableHtml);

        }, this));

        resizeBoxes.call(this);
        $('.lastUpdate span').html(new Date());

        var renderBind = _.bind(renderTimetables, this);
        setTimeout(function() {
            $.get('/api/uptimes').then(renderBind);
        }, this.config.server.checkInterval);
    };

    var renderPage = function(config) {
        this.config = config;

        _.each(config.targets, function(target) {
            $('body').append(tplTarget(target));
        });

        $.get('/api/uptimes').then(_.bind(renderTimetables, this));
    };

    var resizeBoxes = function() {
        var nbHour = (this.config.server.startAt && this.config.server.stopAt) ? this.config.server.stopAt - this.config.server.startAt : 24;
        var totalWidth = $(document).width() - 20 - (nbHour*4); // 20 = paddins / 4 = borders
        var elementWidth = Math.abs(totalWidth / nbHour);
        var size = elementWidth.toFixed(0);
        $('.timetable li.hour').css({ 'width': size+'px', 'height': size+'px' });
        $('.timetable li.time').css('width', size+'px');
    };

    var launch = function() {
        $.get('/api/config').then(_.bind(renderPage, this));
        $(window).resize(_.bind(resizeBoxes, this));
    };

    return {
        'buildTimeTable': buildTimeTable,
        'fillTimeTable': fillTimeTable,
        'launch': launch
    };
})();

try {
    module.exports = Monitor;
} catch(e) {
}
