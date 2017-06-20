var util = require('util');
var _ = require('underscore');
var helpers = require('./helpers');
var Handlebars = require('hbs');
var socket = require('socket.io-client');
var config = require('../../config');

function changeForecast() {
    var symbolFile = helpers.getSymbolFromFile(loc.forecast.longIntervals[forecastIntervalId].symbol);
    var timeFrom = new Date(loc.forecast.longIntervals[forecastIntervalId].start);
    var hoursFrom = timeFrom.getHours();
    var hoursTo = new Date(loc.forecast.longIntervals[forecastIntervalId].end).getHours();
    var temperature = loc.forecast.longIntervals[forecastIntervalId].temperature.value.toFixed(0);
    var dayText = helpers.checkIfDateIsTomorrow(timeFrom) ? 'I morgen' : 'I dag';
    var source = $("#WeatherForecastTemplate").html();
    var template = Handlebars.compile(source);
    var context = {symbolUrl: symbolFile, temperature: temperature};
    var html = template(context);
    $("#forecast").html(html);

    var source = $("#TimeStampTemplate").html();
    var template = Handlebars.compile(source);
    var context = {hoursFrom: hoursFrom, hoursTo: hoursTo, dayText: dayText};
    var html = template(context);
    $("#timestamp").html(html);
    forecastIntervalId++;
    if(forecastIntervalId >= 4) {
       clearInterval(forecastUpdateInterval);
        slideInterval = setInterval(nextSlide, 5000);
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
        forecastUpdateInterval = setInterval(changeForecast, 5000);
    }

    slides[currentSlide].className = 'slide';
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].className = 'slide showing';

    switch(currentSlide) {
        case 0:
            $('#location').html(locTemplate(
                {
                    locationName: loc.properties.name,
                    municipality: loc.properties.municipality,
                    county: loc.properties.county,
                    elevation: loc.properties.elevation
                }));
            break;
        case 1:
            var forecastTemplateSrc = $('#WeatherOldForecastTemplate').html();
            var forecastTemplate = Handlebars.compile(forecastTemplateSrc);
            var trendSeries = _.map(loc.forecast.shortIntervals, function(interval) {
                return interval.symbol.n;
            });
            var oldSymbol = helpers.calculateOldSymbol(_.first(trendSeries, 10));
            var oldSymbolUrl = 'images/' + oldSymbol;

            $('#old-forecast').html(forecastTemplate({
                oldSymbolUrl: oldSymbolUrl,
                textForecast: helpers.getTextForecast(oldSymbol),
                county: loc.properties.county
            }));
            break;
        case 2:
            $('#location').html(locTemplate({locationName: ''}));
            break;
    }
}

function checkTimeAndReload() {
    var hoursNow = new Date().getHours();
    var forecastHoursFrom = new Date(loc.forecast.longIntervals[0].start).getHours();
    if (forecastHoursFrom < hoursNow)
        window.location.reload(true);
}

var slideInterval;
var forecastIntervalId = 0;
var slides = document.querySelectorAll('#slides .slide');
var currentSlide = 0;
var currentPosition;

var forecastUpdateInterval;
var pageUpdateInterval;
if(page != 'yrpage') {
    forecastUpdateInterval = setInterval(changeForecast, 5000);
    pageUpdateInterval= setInterval(checkTimeAndReload, 60000);
};

var gpsEndPoint = socket.connect(config.gpsEndPoint, { reconnect: true});

gpsEndPoint.on('gpsPosition', function(position) {
    if(currentPosition) {
        if(currentPosition.lat != position.lat && currentPosition.lng != position.lng)
            window.location.reload(true);
    }
    currentPosition = position;
});