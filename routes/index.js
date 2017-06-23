var express = require('express');
var router = express.Router();
var helpers = require('../public/javascripts/helpers');
var locationHandler = require('../public/javascripts/locationHandler');
var request = require('request');
var hbs = require('hbs');
var _ = require('underscore');
var util = require('util');
var config = require('../config');

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
        municipality: locationData.properties.municipality,
        county: locationData.properties.county,
        elevation: locationData.properties.elevation,
        locationName: locationData.properties.name,
        locationJsonData: locationData,
        oldSymbolUrl: oldSymbol,
        textForecast: helpers.getTextForecast(oldSymbol)
    });
}

function displayYrPage(response, cause) {
    var message = '';
    switch (cause) {
        case 'missing_gps':
            message = 'Mangler GPS-signal. Forsøker igjen...';
            break;
        case 'max_distance':
            message = 'For langt til nærmeste stasjon...';
            break;
        case 'network_error':
            message = 'Ingen kontakt med internett. Forsøker igjen...';
            break;
    }
    response.render('yrpage', {
        message: message,
        cause: cause
    });
}

router.get('/', (request, response) => {
    var trainPosition = gpsEndPoint.position;
    if(!trainPosition) {
        displayYrPage(response, 'missing_gps');
        return;
    }
    locationHandler.getClosestStationFromPosition(trainPosition.lat, trainPosition.lng, function(closestStation) {
        if(closestStation.properties.distance > config.stationMaxDistance) {
            displayYrPage(response, 'max_distance');
            return;
        }
        locationData = closestStation;
        helpers.getForecast(locationData.properties, function(forecast) {
            if(forecast.hasOwnProperty('error')) {
                displayYrPage(response, forecast.error);
                return;
            }
            locationData.forecast = forecast;
            drawToScreen(response);
        });
    });
});

module.exports = router;