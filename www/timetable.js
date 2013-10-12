var Timetable = (function(undefined) {

    var msPerDay = 86400000; // 24 * 60 * 60 * 1000;

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
        _.each(uptime.results, function(result) {
            var ts = result.timestamp;
            var dayDiff = getDayDiff(ts, now);
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

    var getDayDiff = function(past, now) {
        var n = new Date(now);
        var p = new Date(past);
        var dateNow = new Date(n.getFullYear(), n.getMonth(), n.getDate());
        var datePast = new Date(p.getFullYear(), p.getMonth(), p.getDate());

        var millisBetween = dateNow.getTime() - datePast.getTime();
        return parseInt(Math.abs(millisBetween / msPerDay), 10);
    };


    return {
        'buildTimeTable': buildTimeTable,
        'fillTimeTable': fillTimeTable,
        'getDayDiff': getDayDiff
    };
})();

try {
    module.exports = Timetable;
} catch(e) {
}
