import https = require('https');
import * as manifest from '../../package.json';

interface GithubRelease {
    html_url: string;
    name: string;
}

export interface Version {
    Title: string;
    Number: number;
    ReleaseURL: string;
}

export class Updater {
    private static latestRelease: GithubRelease;

    public static GetNewerRelease(): Promise<Version> {
        const currentVersion = parseInt(manifest.version.replace(/\./g, ''));

        return this.getLatestRelease().then(latest => {
            if (currentVersion < latest.Number) {
                return latest;
            }
            return undefined;
        }, err => {
            console.error('[UPDATE] Error checking for updates', { error: err });
            return undefined;
        }).catch(err => {
            console.error('[UPDATE] Error checking for updates', { error: err });
            return undefined;
        });
    }

    private static async getLatestRelease(): Promise<Version> {
        const latest = await this.getRelease();
        const latestVersionNumber = parseInt(latest.name.replace(/\./g, ''));
        console.log('[UPDATE] Update check complete', {
            'latest-version': latest.name,
            'current-version': manifest.version
        });
        return {
            Title: latest.name,
            Number: latestVersionNumber,
            ReleaseURL: latest.html_url,
        };
    }

    private static getRelease(): Promise<GithubRelease> {
        if (this.latestRelease) {
            return Promise.resolve(this.latestRelease);
        }

        return new Promise((resolve, reject) => {
            const options: https.RequestOptions = {
                protocol: 'https:',
                hostname: 'api.github.com',
                port: 443,
                path: '/repos/ecnepsnai/smp/releases/latest',
                method: 'GET',
                headers: {
                    'User-Agent': manifest.name + '@' + manifest.version,
                    Accept: 'application/vnd.github.v3+json',
                }
            };

            let data = '';
            console.debug('[UPDATE] HTTP GET ' + options.protocol + '//' + options.hostname + ':' + options.port + options.path);
            
            try {
                const req = https.get(options, res => {
                    res.on('error', err => {
                        reject(err);
                        return;
                    });

                    if (res.statusCode !== 200) {
                        reject('HTTP response ' + res.statusCode);
                        return;
                    }

                    res.on('data', (d: string) => {
                        data += d;
                    });

                    res.on('close', () => {
                        try {
                            const release = JSON.parse(data) as GithubRelease;
                            this.latestRelease = release;
                            resolve(release);
                        } catch (err) {
                            reject(err);
                            return;
                        }
                    });
                });
                req.on('error', err => {
                    reject(err);
                    return;
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}
