import { shell } from 'electron';

export class App {
    /**
     * Is this application running in a production configuration.
     *
     * Production configuration is used when the application has been packaged.
     * This will be false if running from the electron wrapper.
     */
    public static isProduction(): boolean {
        return process.env['DEVELOPMENT'] === undefined;
    }

    public static promptBeforeDeletingChecked = true;

    public static openURL(url: string): void {
        console.log('Opening url', { url: url });
        shell.openExternal(url, { activate: true }).catch(err => {
            console.error('Error opening URL', { url: url, error: err });
        });
    }
}