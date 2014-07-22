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
	pm2 start processes.json

stop:
	pm2 stop processes.json

restart:
	pm2 restart processes.json

.PHONY: test
