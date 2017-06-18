var express = require('express');
var router = express.Router();
var helpers = require('../public/javascripts/helpers');
var locationHandler = require('../public/javascripts/locationHandler');
var request = require('request');
var hbs = require('hbs');
var _ = require('underscore');
var util = require('util');

var locationData = {};

hbs.registerHelper('json', function(data) {
    return JSON.stringify(data);
});

function getTrendSeriesForOldSymbol() {
    var midnightIndex = 23;
    var startHour = 6;
    var startIndex = midnightIndex - new Date().getHours() + startHour;
    var endIndex = startIndex + 10;
    return _.map(locationData.forecast.shortIntervals.slice(startIndex, endIndex), function(interval) {
        return interval.symbol.n;
    });
}

function drawToScreen(response) {
    var oldSymbolTrendSeries = getTrendSeriesForOldSymbol();
    var newSymbol = helpers.getSymbolFromFile(locationData.forecast.longIntervals[0].symbol);
    var oldSymbol = helpers.calculateOldSymbol(_.first(oldSymbolTrendSeries, 10));
    var timeFrom = new Date(locationData.forecast.longIntervals[0].start);

    response.setHeader('expires', helpers.cacheExpires);
    response.render('index', {
        hoursFrom: timeFrom.getHours(),
        hoursTo: new Date(locationData.forecast.longIntervals[0].end).getHours(),
        symbolUrl: newSymbol,
        temperature: locationData.forecast.longIntervals[0].temperature.value.toFixed(0),
        dayText: helpers.checkIfDateIsTomorrow(timeFrom) ? 'I morgen' : 'I dag',
        locationName: locationData.properties.name,
        locationJsonData: locationData,
        oldSymbolUrl: oldSymbol,
        textForecast: helpers.getTextForecast(oldSymbol)
    });
}

function missingGps(response) {
    response.render('gpserror');
}

router.get('/', (request, response) => {
    locationHandler.getPosition(function(trainPosition) {
        if(!trainPosition) {
            missingGps(response);
            return;
        }
        locationHandler.getClosestStationFromPosition(trainPosition.lat, trainPosition.lng, function(closestStation){
            locationData = closestStation;
            helpers.getForecast(locationData.properties, function(forecast) {
                locationData.forecast = forecast;
                drawToScreen(response);
            });
        });
    });
});

module.exports = router;