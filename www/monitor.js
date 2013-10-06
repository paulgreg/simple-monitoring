var Monitor = (function(undefined) {

    var buildTimeTable = function(config) {
        var daysToShow  = config.server.daysToShow;
        var startAt     = config.server.startAt ? config.server.startAt : 0;
        var stopAt      = config.server.stopAt  ? config.server.stopAt  : 23;
        var days = [];
        for(var i = 0; i < daysToShow; i++) {
            var hours = [];
            for(var h = startAt; h < stopAt; h++) {
                hours.push({ 'status': 'unknown' });
            }
            days.push({ 'hours': hours });
        }
        var table = { 'days': days };
        return table;
    };
    var fillTimeTable = function(config, now, timetable, uptime) {
        var day = 86400000; // 24 * 60 * 60 * 1000;
        _.each(uptime.results, function(result) {
            var up = result.status === 200 ? 'up' : 'down';
            var ts = result.timestamp;
            var dayDiff = parseInt((now - ts) / day, 10);
            if (dayDiff < config.server.daysToShow) {
                var tsDate = new Date(ts);
                var hour = tsDate.getHours();
                var idxToRemove = (config.server.startAt) ? config.server.startAt : 0;
                var oldStatus = timetable.days[dayDiff].hours[(hour-idxToRemove)].status;
                if (oldStatus !== 'down') {
                    timetable.days[dayDiff].hours[(hour-idxToRemove)].status = up;
                }
            }
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

        var nbHour = (this.config.server.startAt && this.config.server.stopAt) ? this.config.server.stopAt - this.config.server.startAt : 24;
        var size = Math.abs(($(window).width() / nbHour * 0.9).toFixed());

        _.each(uptimes, _.bind(function(uptime, key) {
            var timetable = buildTimeTable(this.config);
            timetable.size = size;

            fillTimeTable(this.config, new Date().getTime(), timetable, uptime);

            var timetableHtml = tplTimetable(timetable);
            $('#'+key+' .timetable').html(timetableHtml);
        }, this));

        $('.lastUpdate').html(new Date());

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

    var launch = function() {
        $.get('/api/config').then(_.bind(renderPage, this));
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
