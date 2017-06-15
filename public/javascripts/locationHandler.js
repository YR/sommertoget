var stationFile = 'public/data/trainstations.json';
var helpers = require('./helpers.js');
var request = require('request');
var util = require('util');
var fs = require('fs');
var path = require('path');
var turf = require('@turf/nearest');

var yrApiUrl = 'https://yr.no/api/v0/locations/id/%s';
module.exports = {
    getClosestStationFromPosition: function(lat, lon, result) {
        var fileName = path.resolve(process.mainModule.filename, '../../', stationFile);
        var trainStations = JSON.parse(fs.readFileSync(fileName, 'utf8'));
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
    },

    getPosition: function() {
        var geoPosition = {"lon": 8.579369, "lat": 60.631813}
        return geoPosition;
    },
    
    getAllStationData: function(stationId, result) {
        var stationData = {};
        getLocationData(stationId, function(data) {
            stationData = data;
            helpers.writeToFile(stationData.name, 'location', stationData);
            helpers.getForecast(stationData._links.forecast.href, function(data) {
                stationData.forecast = data;
                helpers.writeToFile(stationData.name, 'forecast', stationData.forecast);
                result(stationData);
            });
        });
    },
}

function getLocationData(placeId, result) {
    var url = util.format(yrApiUrl, placeId);
    request({url: url, method: 'GET'}, function(error, response, message) {
        if (!error && (response.statusCode === 200 || response.statusCode === 304)) {
            var location = JSON.parse(message);
            result(location);
        }
    });
}