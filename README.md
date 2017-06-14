# sommertoget
App som skal brukes på NRKs Sommertog

## Installering
1. Installer browsersify: `npm install -g browserify` (evt bruk sudo foran)
2. `git clone https://github.com/YR/sommertoget`
3. `cd sommertoget`

## Start app
1. Bygg bundle.js: `browserify index.js > ./public/javascripts/bundle.js`
2. Kjør server: `node ./bin/www`
3. Åpne nettleser på localhost:3000
