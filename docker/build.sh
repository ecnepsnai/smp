#!/bin/sh
set -e

VERSION=${1:?Version Required}

cd deb
./build.sh
cd ../
cd rpm
./build.sh
cd ../

mv deb/smp_${VERSION}_x86_64.deb ../package/artifacts/SMP_linux_${VERSION}_x86_64.deb
mv rpm/smp-${VERSION}-1.x86_64.rpm ../package/artifacts/SMP_linux_${VERSION}_x86_64.rpm
