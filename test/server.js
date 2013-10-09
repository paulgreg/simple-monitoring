var should = require('should');
var monitor = require('../server/monitor')();

describe('Monitor server', function() {
    describe('monitor.js#hasBeenUp', function() {

        it('should say YES', function() {
            var data = [
                { "timestamp": 1000, "status": 500 },
                { "timestamp": 2000, "status": 200 },
                { "timestamp": 3000, "status": 200 }
            ];

            var answer = monitor.hasBeenUp(data, 1500, 0);
            answer.should.be.ok;
        });

        it('should say NO', function() {
            var data = [
                { "timestamp": 1000, "status": 200 },
                { "timestamp": 2000, "status": 404 },
                { "timestamp": 3000, "status": 200 }
            ];

            var answer = monitor.hasBeenUp(data, 1500, 0);
            answer.should.not.be.ok;
        });

        it('should handle flapping and say YES', function() {
            var data = [
                { "timestamp": 1000, "status": 200 },
                { "timestamp": 2000, "status": 404 },
                { "timestamp": 3000, "status": 200 }
            ];

            var answer = monitor.hasBeenUp(data, 0, 1);
            answer.should.be.ok;
        });

        it('should handle flapping and say NO', function() {
            var data = [
                { "timestamp": 1000, "status": 200 },
                { "timestamp": 2000, "status": 200 },
                { "timestamp": 3000, "status": 404 },
                { "timestamp": 4000, "status": 404 },
                { "timestamp": 5000, "status": 200 }
            ];

            var answer = monitor.hasBeenUp(data, 0, 2);
            answer.should.be.ok;
        });
    });

    describe('monitor.js#cleanupResults', function() {
        it('should remove old values', function() {
            var data = {
                "test": {
                    "results": [
                        { "timestamp": 1000, "status": 200 },
                        { "timestamp": 2000, "status": 200 },
                        { "timestamp": 3000, "status": 404 },
                        { "timestamp": 4000, "status": 404 },
                        { "timestamp": 5000, "status": 200 }
                    ]
                }
            };

            monitor.cleanupResults(data, 2500);
            data.test.results.length.should.eql(3);
            data.test.results[0].timestamp.should.eql(3000);
            data.test.results[1].timestamp.should.eql(4000);
            data.test.results[2].timestamp.should.eql(5000);
        });
    });
});
