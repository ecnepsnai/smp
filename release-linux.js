const exec = require('child_process').execSync;

const redhatInstaller = require('electron-installer-redhat');
const debianInstaller = require('electron-installer-debian');
const package = require('./package.json');
const packager = require('./release-package.js');

var packagePromise = packager.app('linux');
packagePromise.then(() => {
    var redhatPromise = new Promise((resolve, reject) => {
        redhatInstaller({
            src: 'build/SMP-linux-x64/',
            name: 'SMP',
            dest: 'build/artifacts',
            icon: 'img/icon.png',
            categories: [
                'Video',
            ],
            arch: 'x86_64'
        }, ((err) => {
            if (err !== null) {
                console.error('Error packaging app for redhat: ', err);
                reject(err);
                return;
            }
            try {
                exec('mv "build/artifacts/SMP-' + package.version + '.x86_64.rpm" "build/artifacts/SMP-' + package.version + '.rpm"');
            } catch (e) {
                reject(e);
                return;
            }
            resolve();
        }));
    });
    var debianPromise = new Promise((resolve, reject) => {
        debianInstaller({
            src: 'build/SMP-linux-x64/',
            name: 'SMP',
            dest: 'build/artifacts',
            icon: 'img/icon.png',
            categories: [
                'Video',
            ],
            arch: 'x86_64'
        }).then(() => {
            try {
                exec('mv "build/artifacts/SMP_' + package.version + '_x86_64.deb" "build/artifacts/SMP-' + package.version + '.deb"');
            } catch (e) {
                reject(e);
                return;
            }
            resolve();
        }, (err) => {
            console.error('Error packaging app for debian: ', err);
            reject(err);
            return;
        });
    });
    return Promise.all([redhatPromise, debianPromise]);
});
