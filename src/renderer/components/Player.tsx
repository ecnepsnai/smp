import * as React from 'react';
import { IPC } from '../services/IPC';
import '../../../css/Player.scss';
import { Path } from '../services/Path';

export interface PlayerProps {
    filePaths: string[];
    onDelete: (idx: number) => void;
}
export const Player: React.FC<PlayerProps> = (props: PlayerProps) => {
    const [CurrentIdx, SetCurrentIdx] = React.useState(0);

    React.useEffect(() => {
        if (CurrentIdx === undefined) {
            return;
        }

        const name = Path.fileName(props.filePaths[CurrentIdx]);

        IPC.setTitle(name + ' - Simple Media Player');
    }, [CurrentIdx]);

    const nextMedia = () => {
        SetCurrentIdx(idx => {
            if (idx >= props.filePaths.length-1) {
                return 0;
            }
            return idx+1;
        });
    };

    const previousMedia = () => {
        SetCurrentIdx(idx => {
            if (idx == 0) {
                return props.filePaths.length-1;
            }
            return idx-1;
        });
    };
    
    const deleteMedia = () => {
        const path = props.filePaths[CurrentIdx];
        IPC.deleteMedia(path).then(deleted => {
            if (!deleted) {
                return;
            }

            props.onDelete(CurrentIdx);
        });
    };

    const keyUpEvent = (event: KeyboardEvent) => {
        switch (event.code) {
        case 'ArrowRight':
            previousMedia();
            break;
        case 'ArrowLeft':
            nextMedia();
            break;
        case 'Delete':
            deleteMedia();
            break;
        }
    };

    React.useEffect(() => {
        window.addEventListener('keyup', keyUpEvent, true);

        return () => {
            window.removeEventListener('keyup', keyUpEvent, true);
        };
    }, []);

    if (!props.filePaths[CurrentIdx]) {
        return null;
    }

    return (
        <div className="player">
            <Media path={props.filePaths[CurrentIdx]} />
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
