var stationFile = './public/data/trainstations.json';
var helpers = require('./helpers.js');
var request = require('request');
var util = require('util');

var yrApiUrl = 'https://yr.no/api/v0/locations/id/%s';
module.exports = {
    getLocationIdFromPosition: function(lat, lon){
        var BlindernId = '1-73738';
        var NesbyenId = '1-113585';
        var StormyriId = '1-111842';
        var ÅlStasjonId = '1-112697';
        return ÅlStasjonId;
    },

    getPostision: function(){

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