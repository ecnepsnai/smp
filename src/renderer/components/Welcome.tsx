import * as React from 'react';
import '../../../css/Welcome.scss';

export interface WelcomeProps {
    onOpenDirectory: () => void;
    onOpenFile: () => void;
}
export const Welcome: React.FC<WelcomeProps> = (props: WelcomeProps) => {
    return (
        <div className="welcome">
            <div className="logo">
                <img src="assets/SMP.png" alt="Simple Media Player" />
            </div>
            <div className="content">
                <h1>Simple Media Player</h1>
                <h5>Start by <a href="#" onClick={props.onOpenDirectory}>Opening a Directory</a> or <a href="#" onClick={props.onOpenFile}>Opening a Single File</a>.</h5>
            </div>
        </div>
    );
};
