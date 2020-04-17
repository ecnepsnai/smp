#!/bin/bash

curl -sS https://use.fontawesome.com/releases/v5.13.0/fontawesome-free-5.13.0-web.zip > fontawesome.zip
unzip fontawesome.zip >/dev/null
rm fontawesome.zip
mkdir -p copy/assets/css
mv fontawesome-free-*/css/all.min.css copy/assets/css/fontawesome.css
mv fontawesome-free-*/webfonts copy/assets/webfonts
rm -r fontawesome-free-*