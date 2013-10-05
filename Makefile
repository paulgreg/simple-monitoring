all: unit func

debug:
	./node_modules/.bin/nodemon --debug app/monitor.js

start:
	./node_modules/.bin/forever start app/monitor.js

stop:
	./node_modules/.bin/forever stop app/monitor.js

run:
	./node_modules/.bin/nodemon app/monitor.js

.PHONY: test
