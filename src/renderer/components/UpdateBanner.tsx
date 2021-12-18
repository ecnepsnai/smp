import * as React from 'react';
import { IPC } from '../services/IPC';
import { Link } from './Link';
import { Icon } from './Icon';
import '../../../css/UpdateBanner.scss';

export const UpdateBanner: React.FC = () => {
    const [NewVersionURL, SetNewVersionURL] = React.useState<string>();
    const [HideBanner, SetHideBanner] = React.useState<boolean>(false);

    React.useEffect(() => {
        IPC.checkForUpdates().then(newURL => {
            SetNewVersionURL(newURL);
        });
    }, []);

    if (!NewVersionURL || HideBanner) {
        return null;
    }

    const clickHideBanner = () => {
        SetHideBanner(true);
    };

    return (
        <div className="new-version">
            <div className="content">
                <strong>A newer version is available</strong>
                <Link url={NewVersionURL}>Click here to view</Link>
            </div>
            <button className="close-button" type="button" onClick={clickHideBanner}><Icon.Times /></button>
        </div>
    );
};
