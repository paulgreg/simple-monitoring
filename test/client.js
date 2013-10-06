var should = require('should');
var monitor = require('../www/monitor');

describe('Monitor client', function() {
    describe('#buildTimeTable', function() {

        it('should returns a timetable', function() {
            var table = monitor.buildTimeTable({ 
                'server': {
                    'daysToShow': 4,
                    'startAt': 8,
                    'stopAt': 20
                }
            });

            table.days.length.should.eql(4);
            table.days[0].hours.length.should.eql(12);
        });
    });
});
