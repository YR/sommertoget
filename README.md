# sommertoget
App som skal brukes på NRKs Sommertog

## Installering
1. `git clone https://github.com/YR/sommertoget`
2. `cd sommertoget`
3. Installer avhengigheter `npm install`
4. Installer browsersify: `npm install -g browserify` (evt bruk sudo foran)
5. Kopier config_sample.js til config.js og gjør nødvendige endringer

## Bygg applikasjon
`npm run build`

## Start app
1. Start server: `npm start`
2. Åpne nettleser på http://localhost:3000 eller http://127.0.0.1:3000

## Start med script
Scriptet henter ned siste versjon fra GitHub, og bygger lokal installasjon.
Starter deretter Chromium browser i kiosk-modus. Filen lagres på ~/ som sommertoget_start.
Husk å gjøre filen kjørbar med kommandoen `sudo cmod 755 sommertoget_start`

```
#!/bin/sh
cd ~/sommertoget;
if git pull; then
   echo "Lastet ned siste versjon fra Github"
   #npm install;
   npm run build-js;
else
   echo "Ikke kontakt med Gihub. Internett-forbindelse nede?"
fi
echo "Starter server og nettleser"
npm start &
/usr/bin/chromium-browser --incognito  --noerrdialogs --disable-session-crashed-
bubble --disable-infobars --kiosk http://localhost:3000;
```

Gå til mappen ~/.config/lxsession/LXDE-pi og editer fila autostart:

```
@lxpanel --profile LXDE-pi
#@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash
@point-rpi

#Disable screen saver
@xset s noblank
@xset s off
@xset -dpms

@./sommertoget_start
```
