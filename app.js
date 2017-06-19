var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var io = require('socket.io-client');
var config = require('./config');
var util = require('util');
var debug = require('debug');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.set('view cache', true);


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

gpsEndPoint = io.connect(config.gpsEndPoint, { reconnect: true});
gpsEndPoint.on('connect', function() {
    debug(util.format('Koblet til GPS-endepunkt %s', config.gpsEndPoint));
});

gpsEndPoint.on('disconnect', function() {
    debug('Koblet fra GPS-endepunkt');
});

gpsEndPoint.on('gpsPosition', function(position) {
    gpsEndPoint.position = position;
    debug(util.format('Posisjon: %d, %d', position.lat, position.lng));
});

module.exports = app;