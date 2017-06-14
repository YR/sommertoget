var util = require('util');
var _ = require('underscore');
var helpers = require('./helpers.js');
var Handlebars = require('hbs');

function changeForecast() {
    var symbolFile = helpers.getSymbolFromFile(loc.forecast.longIntervals[forecastIntervalId].symbol);
    var timeFrom = new Date(loc.forecast.longIntervals[forecastIntervalId].start).getHours();
    var timeTo = new Date(loc.forecast.longIntervals[forecastIntervalId].end).getHours();
    var temperature = loc.forecast.longIntervals[forecastIntervalId].temperature.value.toFixed(0);
    var source = $("#WeatherTemplateForecast").html();
    var template = Handlebars.compile(source);
    var context = {symbolUrl: symbolFile, timeFrom: timeFrom, timeTo: timeTo, temperature: temperature};
    var html = template(context);
    $("#forecast").html(html);
    forecastIntervalId++;
    if(forecastIntervalId >= 4) {
       clearInterval(forecastUpdateInterval);
        slideInterval = setInterval(nextSlide, 2000000);
    }
}

function nextSlide() {
    var locTemplateSrc = $('#LocationTemplate').html();
    var locTemplate = Handlebars.compile(locTemplateSrc);

    if(currentSlide >= 2) {
        clearInterval(slideInterval);
        forecastIntervalId = 0;
        forecastUpdateInterval = setInterval(changeForecast, 2000000);
    }

    slides[currentSlide].className = 'slide';
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].className = 'slide showing';

    switch(currentSlide) {
        case 0:
            $('#location').html(locTemplate({locationName: loc.name}));
            break;
        case 1:
            var forecastTemplateSrc = $('#WeatherTemplateOldForecast').html();
            var forecastTemplate = Handlebars.compile(forecastTemplateSrc);
            $('#location').html(locTemplate({locationName: loc.region.name}));
            $('#old-forecast').html(forecastTemplate({
                oldsymbolUrl: 'images/' + oldSymbol,
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

var trendSeries = _.map(loc.forecast.shortIntervals, function(interval) {
     return interval.symbol.n;
});
var oldSymbol = helpers.calculateOldSymbol(_.first(trendSeries, 10));
var forecastUpdateInterval = setInterval(changeForecast, 1000);
