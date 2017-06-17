var util = require('util');
var _ = require('underscore');
var helpers = require('./helpers.js');
var Handlebars = require('hbs');
var socket = require('socket.io-client');

function changeForecast() {
    var symbolFile = helpers.getSymbolFromFile(loc.forecast.longIntervals[forecastIntervalId].symbol);
    var timeFrom = new Date(loc.forecast.longIntervals[forecastIntervalId].start).getHours();
    var timeTo = new Date(loc.forecast.longIntervals[forecastIntervalId].end).getHours();
    var temperature = loc.forecast.longIntervals[forecastIntervalId].temperature.value.toFixed(0);
    var source = $("#WeatherTemplateForecast").html();
    var template = Handlebars.compile(source);
    var context = {symbolUrl: symbolFile, temperature: temperature};
    var html = template(context);
    $("#forecast").html(html);

    var source = $("#TimeStampTemplate").html();
    var template = Handlebars.compile(source);
    var context = {timeFrom: timeFrom, timeTo: timeTo};
    var html = template(context);
    $("#timestamp").html(html);
    forecastIntervalId++;
    if(forecastIntervalId >= 4) {
       clearInterval(forecastUpdateInterval);
        slideInterval = setInterval(nextSlide, 2000);
    }
}

function nextSlide() {
    var locTemplateSrc = $('#LocationTemplate').html();
    var locTemplate = Handlebars.compile(locTemplateSrc);

    if(currentSlide > 1) {
        //reset forecast interval
        forecastIntervalId = 0;
        changeForecast();
    }

    if(currentSlide >= 2) {
        clearInterval(slideInterval);
        forecastUpdateInterval = setInterval(changeForecast, 2000);
    }

    slides[currentSlide].className = 'slide';
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].className = 'slide showing';

    switch(currentSlide) {
        case 0:
            $('#location').html(locTemplate({locationName: loc.properties.name}));
            break;
        case 1:
            var forecastTemplateSrc = $('#WeatherTemplateOldForecast').html();
            var forecastTemplate = Handlebars.compile(forecastTemplateSrc);
            var oldSymbolUrl = 'images/' + oldSymbol;
            $('#location').html(locTemplate({locationName: loc.properties.county}));
            $('#old-forecast').html(forecastTemplate({
                oldSymbolUrl: oldSymbolUrl,
                textForecast: helpers.getTextForecast(oldSymbol)
            }));
            break;
        case 2:
            $('#location').html(locTemplate({locationName: ''}));
            break;
    }
}

var slideInterval;
var forecastIntervalId = 0;
var slides = document.querySelectorAll('#slides .slide');
var currentSlide = 0;
var currentPosition;
var lastPosition;

var trendSeries = _.map(loc.forecast.shortIntervals, function(interval) {
     return interval.symbol.n;
});
var oldSymbol = helpers.calculateOldSymbol(_.first(trendSeries, 10));
var forecastUpdateInterval = setInterval(changeForecast, 2000);
var gpsEndPoint = socket.connect('http://localhost:2000', { reconnect: true});
gpsEndPoint.on('gpsPosition', function(position) {
    if(currentPosition) {
        if(currentPosition.lat != position.lat && currentPosition.lng != position.lng)
            window.location.reload(true);
    }
    currentPosition = position;
});