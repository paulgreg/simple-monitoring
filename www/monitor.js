var Monitor = (function(undefined) {

    var config = null;

    try {
        var $tplTarget = $('#tpl-target');
        var tplTarget = _.template($tplTarget.text());
        var $tplTimetable = $('#tpl-timetable');
        var tplTimetable = _.template($tplTimetable.text());
    } catch(e) {}

    var renderTimetables = function(uptimes) {

        _.each(uptimes, _.bind(function(uptime, key) {
            var timetable = Timetable.buildTimeTable(this.config);

            Timetable.fillTimeTable(_, this.config, new Date().getTime(), timetable, uptime);

            var timetableHtml = tplTimetable(timetable);
            $('#'+key+' .timetable').html(timetableHtml);

        }, this));

        resizeBoxes.call(this);
        $('.lastUpdate span').html(new Date());

        var renderBind = _.bind(renderTimetables, this);
        setTimeout(function() {
            $.get('/api/uptimes').then(renderBind);
        }, this.config.common.checkInterval);
    };

    var resizeBoxes = function() {
        var nbHour = (this.config.common.startAt && this.config.common.stopAt) ? this.config.common.stopAt - this.config.common.startAt : 24;
        var totalWidth = $(document).width() - 20 - (nbHour*4); // 20 = paddins / 4 = borders
        var elementWidth = Math.abs(totalWidth / nbHour);
        var size = elementWidth.toFixed(0);
        $('.timetable li.hour').css({ 'width': size+'px', 'height': size+'px' });
        $('.timetable li.time').css('width', size+'px');
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
        $(window).resize(_.bind(resizeBoxes, this));
    };

    return {
        'launch': launch
    };
})();
