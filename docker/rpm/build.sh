#!/bin/sh
set -e

ARCH='x64'
if [[ $(uname -m) == "aarch64" ]]; then
    ARCH='arm64'
fi

podman build -t smp_rh_build:latest .

rm -rf build_root
mkdir -p build_root/package
cp package_rpm.js build_root
cp -r "../../package/Simple Media Player-linux-${ARCH}" build_root/package

podman run --rm --user root -v $(readlink -f build_root):/build_root:z smp_rh_build:latest

cp build_root/package/artifacts/*.rpm .
rm -rf build_root
