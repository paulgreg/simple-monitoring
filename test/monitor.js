var should = require('should');
var monitor = require('../app/monitor')();

describe('Monitor', function() {
    describe('#isUp since last hour', function() {

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
});
