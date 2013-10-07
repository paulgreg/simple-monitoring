all: unit func

tdd:
	./node_modules/.bin/mocha --watch

unit:
	./node_modules/.bin/mocha

debug:
	./node_modules/.bin/mocha
	./node_modules/.bin/nodemon --debug server/launcher.js

run:
	./node_modules/.bin/mocha
	./node_modules/.bin/nodemon server/launcher.js

start:
	./node_modules/.bin/forever start server/launcher.js

stop:
	./node_modules/.bin/forever stop server/launcher.js

.PHONY: test
