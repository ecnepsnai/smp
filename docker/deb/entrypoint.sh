#!/bin/sh

cd /build_root
npm init -y
npm i --save electron-installer-debian
node package_deb.js