var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var request = require('request');

module.exports = {
    isEmptyObject: function (obj) {
        return !Object.keys(obj).length;
    },

    setNextUpdate: function(headers) {
        var expiresHeader = headers['expires'];
        this.cacheExpires = new Date(expiresHeader);
    },

    writeToFile: function(folderName, fileName, data) {
        // Create folder if not exist
        if(!fs.existsSync('./public/data/stations/' + folderName)) {
            fs.mkdirSync('./public/data/stations/' + folderName);
        }
        fs.writeFile('./public/data/stations/' + folderName + '/' + fileName + '.json', JSON.stringify(data), "utf8", function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(fileName + '.json, ble lagret!');
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
    
    getForecast: function(locationUrl, result) {
        self = this;
        request({url: 'https://yr.no' + locationUrl, method: 'GET'}, function(error, response, message) {
            if (!error && (response.statusCode === 200 || response.statusCode === 304)) {
                var forecast = JSON.parse(message);
                self.setNextUpdate(response.headers); 
                result(forecast);
            }
        });
    }
}