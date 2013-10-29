# A simple monitoring tool

That tool is a simple node server which checks status code (200) and non empty response from some target URLs each X seconds.
It handles flapping based on number of failures in a row (that means a single failure could be ignored if around 2 success).

A web UI shows each targets status :
   - up / green
   - down / red (flapping is reached)
   - instable / orange (at least one error)

![Example](https://raw.github.com/paulgreg/simple-monitoring/master/monitoring.png)

Optionaly, simple-monitoring could send an email when a host is down.

## Dependencies

You’ll need node, npm and bower (npm install -g bower).

## Install

To use it, you‘ll need to :
  1. launch `npm install` to install server dependencies,
  2. launch `bower install` to install client dependencies,
  2. in `app`, create a `config.json` file (copy `config.json.dist`) and adapt configuration to your needs, 
  4. then launch the server with `make run`,
  5. open your browser on `http://localhost:8000/`.

## Run in production

To run program as a service, run `make start` (and `make stop` to stop it).

## Develop

During development, you can use `make run` or `make debug`. Both will reload the app when a file changes.

You can launch unit test using `make unit` or `make tdd` (Unit test will be launch each time a test changes).
