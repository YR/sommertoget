var config = {};
config.gpsEndPoint = 'http://localhost:2000';
config.yrApiLocationUrl = 'https://yr.no/api/v0/locations/id/%s';

//Max distance between train and station. If greater, show Yr screen only
config.stationMaxDistance = 10;

module.exports = config;