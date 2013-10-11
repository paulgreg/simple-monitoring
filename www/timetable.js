var Timetable = (function(undefined) {

    var buildTimeTable = function(config, currentHour) {
        var daysToShow  = config.common.daysToShow;
        var startAt     = config.common.startAt ? config.common.startAt : 0;
        var stopAt      = config.common.stopAt  ? config.common.stopAt  : 24;
        var days = [];
        for(var i = 0; i < daysToShow; i++) {
            var hours = [];
            for(var h = startAt; h < stopAt; h++) {
                var current = currentHour === h;
                hours.push({ 'status': 'unknown', 'statusCodes': [], 'current': current });
            }
            days.push({ 'hours': hours });
        }
        var table = { 'days': days, 'startAt': startAt, 'stopAt': stopAt };
        return table;
    };

    var fillTimeTable = function(_, config, now, timetable, uptime) {
        var day = 86400000; // 24 * 60 * 60 * 1000;
        _.each(uptime.results, function(result) {
            var ts = result.timestamp;
            var dayDiff = parseInt((now - ts) / day, 10);
            if (dayDiff < timetable.days.length) {
                var tsDate = new Date(ts);
                var hour = tsDate.getHours();
                var idxToRemove = (config.common.startAt) ? config.common.startAt : 0;
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
                            if (previousFails >= config.common.flapping) {
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


    return {
        'buildTimeTable': buildTimeTable,
        'fillTimeTable': fillTimeTable
    };
})();

try {
    module.exports = Timetable;
} catch(e) {
}
