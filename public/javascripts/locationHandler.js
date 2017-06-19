var config = require('../../config')
var stationFile = 'public/data/trainstations.json';
var helpers = require('./helpers');
var request = require('request');
var util = require('util');
var fs = require('fs');
var path = require('path');
var turf = require('@turf/nearest');

var currentPosition = {};

module.exports = {
    getClosestStationFromPosition: function(lat, lon, result) {
        var fileName = path.resolve(process.mainModule.filename, '../../', stationFile);
        fs.readFile(fileName, 'utf8', function(err, data) {
            if(err) throw error;
            var trainStations = JSON.parse(data);
            var trainPosition = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                }
            };
            var closestStation = turf(trainPosition, trainStations);
            result(closestStation);
        });
    },

    getAllStationData: function(stationId, result) {
        var stationData = {};
        getLocationData(stationId, function(data) {
            stationData = data;
            helpers.writeToFile(stationData.name, 'location', stationData, function() {
                helpers.getForecast(stationData._links.forecast.href, function(data) {
                    stationData.forecast = data;
                    helpers.writeToFile(stationData.name, 'forecast', stationData.forecast);
                    result(stationData);
                });
            });
        });
    }
}

function getLocationData(placeId, result) {
    var url = util.format(config.yrApiLocationUrl, placeId);
    request({url: url, method: 'GET'}, function(error, response, message) {
        if (!error && (response.statusCode === 200 || response.statusCode === 304)) {
            var location = JSON.parse(message);
            result(location);
        }
    });
}