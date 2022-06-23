import * as React from 'react';
import { IPC } from '../services/IPC';
import { Path } from '../services/Path';
import { Icon } from './Icon';
import '../../../css/Player.scss';

export interface PlayerProps {
    filePaths: string[];
    onDelete: (idx: number) => void;
    onFlaggedMediaChange: (media: Map<string, boolean>) => void;
}
interface PlayerState {
    currentIdx: number;
    flaggedMedia: Map<string, boolean>;
}
export const Player: React.FC<PlayerProps> = (props: PlayerProps) => {
    const [State, SetState] = React.useState<PlayerState>({ currentIdx: 0, flaggedMedia: new Map()});

    const CurrentMedia = () => {
        return props.filePaths[State.currentIdx];
    };
    
    React.useEffect(() => {
        if (State === undefined) {
            return;
        }

        const name = Path.fileName(CurrentMedia());
        IPC.setTitle(name + ' - Simple Media Player');
        props.onFlaggedMediaChange(State.flaggedMedia);
    }, [State]);

    const nextMedia = () => {
        SetState(state => {
            if (state.currentIdx >= props.filePaths.length-1) {
                state.currentIdx = 0;
            } else {
                state.currentIdx += 1;
            }

            return {...state};
        });
    };

    const previousMedia = () => {
        SetState(state => {
            if (state.currentIdx == 0) {
                state.currentIdx = props.filePaths.length-1;
            } else {
                state.currentIdx -= 1;
            }

            return {...state};
        });
    };
    
    const deleteMedia = () => {
        const path = CurrentMedia();
        IPC.deleteMedia(path).then(deleted => {
            if (!deleted) {
                return;
            }

            props.onDelete(State.currentIdx);
        });
    };

    const flagMedia = () => {
        SetState(state => {
            const flag = state.flaggedMedia.get(props.filePaths[state.currentIdx]);
            state.flaggedMedia.set(props.filePaths[state.currentIdx], !flag);
            return {...state};
        });
    };

    const statMedia = () => {
        const path = CurrentMedia();
        IPC.showFileInfo(path);
    };

    const keyUpEvent = (event: KeyboardEvent) => {
        switch (event.code) {
        case 'ArrowLeft':
            previousMedia();
            break;
        case 'ArrowRight':
            nextMedia();
            break;
        case 'Delete':
            deleteMedia();
            break;
        case 'KeyF':
            flagMedia();
            break;
        case 'F1':
            statMedia();
            break;
        }
    };

    React.useEffect(() => {
        window.addEventListener('keyup', keyUpEvent, true);

        return () => {
            window.removeEventListener('keyup', keyUpEvent, true);
        };
    }, []);

    if (!CurrentMedia()) {
        return null;
    }

    const flag = () => {
        if (!State.flaggedMedia.get(CurrentMedia())) {
            return null;
        }

        return (<div className="media-flag"><Icon.Flag /></div>);
    };

    return (
        <div className="player">
            {flag()}
            <Media path={CurrentMedia()} />
        </div>
    );
};


interface MediaProps {
    path: string;
}
const Media: React.FC<MediaProps> = (props: MediaProps) => {
    const [MaxWidth, SetMaxWidth] = React.useState(window.outerWidth);
    const [MaxHeight, SetMaxHeight] = React.useState(window.outerHeight);

    const onResize = () => {
        SetMaxWidth(window.outerWidth);
        SetMaxHeight(window.outerHeight);
    };

    React.useEffect(() => {
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const style: React.CSSProperties = {
        maxWidth: MaxWidth+'px',
        maxHeight: MaxHeight+'px',
    };

    if (props.path.toLowerCase().endsWith('.webm') || props.path.toLowerCase().endsWith('.mp4')) {
        return (
            <div className="media">
                <video src={'smp://'+props.path} loop autoPlay controls style={style} />
            </div>
        );
    }

    return (
        <div className="media">
            <img src={'smp://'+props.path} style={style} />
        </div>
    );
};
