var should = require('should');
var _ = require('underscore');
var Timetable = require('../www/timetable');

describe('Monitor client', function() {

    // Given (common)
    var minute = 60 * 1000;
    var hour = 60 * minute;
    var day = 24 * hour;

    describe('timetable.js#getDayDiff', function() {

        it('should returns 1 for yesterday', function() {

            var now = 1381563674655; // Sat Oct 12 2013 09:41:05 GMT+0200 (CEST) 
            var yesterdayEvening = now - hour * 10;

            // When
            var dayDiff = Timetable.getDayDiff(yesterdayEvening, now);

            // Then
            dayDiff.should.eql(1);
        });

        it('should returns 0 for today', function() {

            var now = 1381544212676;
            var justBefore= 1381564431729;

            // When
            var dayDiff = Timetable.getDayDiff(justBefore, now);

            // Then
            dayDiff.should.eql(0);
        });
    
    });



    describe('timetable.js#buildTimeTable', function() {

        it('should returns a timetable', function() {

            // When
            var timetable = Timetable.buildTimeTable({ 
                'common': {
                    'daysToShow': 1
                }
            }, 12);

            // Then
            timetable.days.length.should.eql(1);
            timetable.days[0].hours.length.should.eql(24);
        });

        it('should returns a timetable with startAt/stopAt parameters', function() {

            var startAt = 8;
            var currentHour = 12;

            // When
            var timetable = Timetable.buildTimeTable({ 
                'common': {
                    'daysToShow': 4,
                    'startAt': startAt,
                    'stopAt': 20
                }
            }, currentHour);

            // Then
            timetable.days.length.should.eql(4);
            timetable.days[0].hours.length.should.eql(12);
            timetable.days[0].hours[0].current.should.eql(false);
            timetable.days[0].hours[currentHour-startAt].current.should.eql(true);
        });

    });


    describe('timetable.js#fillTimeTable', function() {

        // Given (common)
        var timetable = {
            "days": [
                { 
                    "hours": [
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] }
                    ]
                },
                { 
                    "hours": [
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] },
                        {"status":"unknown", 'statusCodes': [] }
                    ]
                }
            ]
        };

        var now = day + 12*hour;

        var uptime = {
            "url":"https://www.google.fr",
            "results": [
                // Today
                {"timestamp":now - minute, "status": 200},
                {"timestamp":now - hour - minute, "status": 404},
                {"timestamp":now - 2*hour - minute, "status": 404},
                {"timestamp":now - 2*hour - minute, "status": 404},
                // Yesterday
                {"timestamp":now - day - hour - minute, "status": 200},
                {"timestamp":now - day - 2*hour - minute, "status": 404},
                {"timestamp":now - day - 3*hour - minute, "status": 404},
                {"timestamp":now - day - 3*hour - minute, "status": 404},
                // The day before 
                {"timestamp":now - 2*day, "status": 200},
            ]
        };

        it('should fill timetable', function() {

            // Given
            var config = {
                'common': {
                    'flapping': 2
                }
            };

            // When
            Timetable.fillTimeTable(_, config, now, timetable, uptime);

            // Then
            //  Today
            timetable.days[0].hours[12].status.should.eql('up');
            timetable.days[0].hours[11].status.should.eql('instable');
            timetable.days[0].hours[10].status.should.eql('down');
            timetable.days[0].hours[09].status.should.eql('unknown');
            //  Yesterday
            timetable.days[1].hours[11].status.should.eql('up');
            timetable.days[1].hours[10].status.should.eql('instable');
            timetable.days[1].hours[09].status.should.eql('down');
            timetable.days[1].hours[08].status.should.eql('unknown');
        });
        
        it('should fill timetable with startAt/stopAt argument', function() {

            // Given
            var config = {
                'common': {
                    'flapping': 2,
                    'startAt': 8,
                    'stopAt': 20
                }
            };


            // When
            Timetable.fillTimeTable(_, config, now, timetable, uptime);

            // Then
            //  Today
            timetable.days[0].hours[4].status.should.eql('up');
            timetable.days[0].hours[3].status.should.eql('instable');
            timetable.days[0].hours[2].status.should.eql('down');
            timetable.days[0].hours[1].status.should.eql('unknown');
            //  Yesterday
            timetable.days[1].hours[3].status.should.eql('up');
            timetable.days[1].hours[2].status.should.eql('instable');
            timetable.days[1].hours[1].status.should.eql('down');
            timetable.days[1].hours[0].status.should.eql('unknown');
        });

    });
});
