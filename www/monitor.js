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
    var fillTimeTable = function(timetable, uptimes) {
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
            var timetableHtml = tplTimetable(timetable);
            $('#'+key+' .timetable').html(timetableHtml);
        }, this));
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
