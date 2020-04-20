#!/bin/bash

rm -rf build/
mkdir -p build/artifacts
rm -rf static/
rm -rf node_modules/
rm -rf copy/
./install.sh
npm install
gulp
gulp release

node release-darwin.js
node release-linux.js

wait $(jobs -p)
