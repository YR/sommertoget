var fs = require('fs');
var util = require('util');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var agent = require('@yr/agent');
var config = require('../../config');

var cacheExpires;

module.exports = {

    cacheExpires,

    isEmptyObject: function (obj) {
        return !Object.keys(obj).length;
    },

    setNextUpdate: function(headers) {
        var expiresHeader = headers['expires'];
        this.cacheExpires = new Date(expiresHeader);
    },

    checkIfDateIsTomorrow: function(dateToCheck) {
        var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        if(dateToCheck.getDay() == tomorrow.getDay())
            return true;
        return false;
    },

    writeToFile: function(folderName, fileName, data) {
        var pathName = path.resolve('./public/data/stations', folderName);
        // Create folder if not exist
        if(!fs.existsSync(pathName)) {
            fs.mkdirSync(pathName);
        }
        var fileName = path.resolve(pathName, fileName);
        fs.writeFile(fileName, JSON.stringify(data), "utf8", function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(util.format('%s, ble lagret!', fileName));
        });
    },

    pad: function(n) {
        return(n < 10 ) ? ("0" + n) : n;
    },

    getSymbolFromFile: function(symbol) {
        var self = this;
        var symbolVariant = '';
        if(symbol.var) {
            switch(symbol.var) {
                case 'Sun':
                    symbolVariant = 'd';
                    break;
                case 'Moon':
                    symbolVariant = 'n';
                    break;
                default:
                    symbolVariant = '';
                    break;
            }
        }
        return util.format('images/%s%s.svg', self.pad(symbol.n), symbolVariant)
    },

    calculateOldSymbol: function(timeSeries) {
        var self = this;
        var numberOfDrySymbols = 0;
        var numberOfWetSymbols = 0;
        var wetDryDistribution = [];
        var weight = 1;
        var dryCount = 0;
        var wetCount = 0;
        _.each(timeSeries, function(symbolNumber) {
            if(self.symbolIsDry(symbolNumber)) {
                numberOfDrySymbols++;
                dryCount += weight;
                wetDryDistribution.push(1);
            }
            else {
                numberOfWetSymbols++;
                wetCount += weight;
                wetDryDistribution.push(0);
            }
            weight = weight * 2;
        });

        if(numberOfDrySymbols === timeSeries.length)
            return 'opphold.svg';
        if(numberOfWetSymbols === timeSeries.length)
            return 'regn.svg';

        if(dryCount > wetCount)
            return 'oppklarende.svg';
        else if(dryCount < wetCount)
            return 'ustabilt.svg';
    },

    symbolIsDry: function(symbolNumber) {
        var dryWeatherSymbolNumbers = [1, 2, 3, 4];
        return _.contains(dryWeatherSymbolNumbers, symbolNumber);
    },

    getTextForecast: function(oldSymbolFile) {
        var forecast = '';
        switch(oldSymbolFile) {
            case 'oppklarende.svg':
                forecast = 'Oppklarende Vejr';
                break
            case 'ustabilt.svg':
                forecast = 'Utrygt Vejr';
                break;
            case 'regn.svg':
                forecast = 'Regnvejr';
                break;
            case 'opphold.svg':
                forecast = 'Tørt Vejr';
                break;
        }
        return forecast;
    },
    
    getAllDataFromYr: function() {
        var self = this;
        if(fs.existsSync(stationFile)) {
            var stations = fs.readFile(stationFile);
            _.each(stations, function(station) {
                self.getAllStationData(station.id);
            });
        }
    },
    
    getForecast: function(location, result) {
        self = this;
        var locationUrl = util.format(config.yrApiLocationUrl, location.id) + '/forecast';
        
        if(self.cacheExpires && self.cacheExpires > new Date())
            return;
        agent
            .get(locationUrl)
            .timeout(1000)
            .retry(3)
            .then((data) => {
                self.setNextUpdate(data.headers);
                self.writeToFile(location.name, 'forecast.json', data.body);
                result(data.body);
            })
            .catch((err) => {
                var fileName =path.resolve('./public/data/stations', location.name, 'forecast.json');
                fs.readFile(fileName, 'utf-8', (err, data) => {
                    if(err) throw err;
                    var forecast = data;
                    result(JSON.parse(forecast));
                })
            });
    }
}