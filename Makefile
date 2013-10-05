all: unit func

tdd:
	./node_modules/.bin/mocha --watch

unit:
	./node_modules/.bin/mocha

debug:
	./node_modules/.bin/mocha
	./node_modules/.bin/nodemon --debug app/launcher.js

run:
	./node_modules/.bin/mocha
	./node_modules/.bin/nodemon app/launcher.js

start:
	./node_modules/.bin/forever start app/launcher.js

stop:
	./node_modules/.bin/forever stop app/launcher.js

.PHONY: test
