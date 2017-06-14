var express = require('express');
var router = express.Router();
var helpers = require('../public/javascripts/helpers.js');
var locationHandler = require('../public/javascripts/locationHandler.js');
var request = require('request');
var hbs = require('hbs');
var _ = require('underscore');

var yrApiUrl = 'https://yr.no/api/v0/locations/id/%s';
var locationData = {};
var locationOnly = {};

hbs.registerHelper('json', function(data) {
    return JSON.stringify(data);
});

function drawToScreen(response) {
    var midnightIndex = 23;
    var startHour = 6;
    var startIndex = midnightIndex - new Date().getHours() + startHour;
    var endIndex = startIndex + 10;
    var oldSymbolTrendSeries = _.map(locationData.forecast.shortIntervals.slice(startIndex, endIndex), function(interval) {
        return interval.symbol.n;
    });
    var newSymbol = helpers.getSymbolFromFile(locationData.forecast.longIntervals[0].symbol);
    var oldSymbol = helpers.calculateOldSymbol(_.first(oldSymbolTrendSeries, 10))

    response.render('index', {
        timeFrom: new Date(locationData.forecast.longIntervals[0].start).getHours(),
        timeTo: new Date(locationData.forecast.longIntervals[0].end).getHours(),
        symbolUrl: newSymbol,
        temperature: locationData.forecast.longIntervals[0].temperature.value.toFixed(0),
        locationName: locationData.name,
        locationJsonData: locationData,
        oldSymbolUrl: oldSymbol,
        textForecast: helpers.getTextForecast(oldSymbol)
    });
}

router.get('/', (request, response) => {
    var locationId = locationHandler.getLocationIdFromPosition(0, 0);
    locationHandler.getAllStationData(locationId, function(data) {
        locationData = data;
        drawToScreen(response);
    });
});

module.exports = router;