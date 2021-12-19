import * as React from 'react';
import { IPC } from './services/IPC';
import { Welcome } from './components/Welcome';
import { Player } from './components/Player';
import { Rand } from './services/Rand';
import { UpdateBanner } from './components/UpdateBanner';
import '../../css/App.scss';

export const App: React.FC = () => {
    const [MediaHash, SetMediaHash] = React.useState(Rand.ID());
    const [MediaFiles, SetMediaFiles] = React.useState<string[]>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [FlaggedMediaPaths, SetFlaggedMediaPaths] = React.useState<string[]>();

    React.useEffect(() => {
        IPC.onMediaLoad(media => {
            SetMediaFiles(media);
        });

        IPC.onMediaShuffle(() => {
            SetMediaFiles(mediaFiles => {
                if (!mediaFiles) {
                    return undefined;
                }

                const shuffled = mediaFiles.map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value);
                return [...shuffled];
            });
        });

        IPC.onMediaClose(() => {
            SetMediaFiles(undefined);
        });
        
        IPC.onCopyFlaggedMedia(() => {
            SetFlaggedMediaPaths(paths => {
                IPC.copyFlaggedMedia(paths);
                return paths;
            });
        });
    }, []);

    React.useEffect(() => {
        SetMediaHash(Rand.ID());
        console.log('Media files', MediaFiles);
    }, [MediaFiles]);

    React.useEffect(() => {
        console.log('Updating media hash', MediaHash);
    }, [MediaHash]);

    const openDirectoryClick = () => {
        IPC.openDirectory().then(files => {
            if (files !== null) {
                SetMediaFiles(files);
            }
        });
    };

    const openSingleFileClick = () => {
        IPC.openSingleFile().then(file => {
            if (file !== null) {
                SetMediaFiles([file]);
            }
        });
    };

    const onDelete = (idx: number) => {
        SetMediaFiles(mediaFiles => {
            if (mediaFiles.length === 1) {
                return undefined;
            }

            mediaFiles.splice(idx, 1);
            return [...mediaFiles];
        });
    };

    const onFlaggedMediaChange = (flaggedMedia: Map<string, boolean>) => {
        const paths: string[] = [];
        flaggedMedia.forEach((flagged, path) => {
            if (flagged) {
                paths.push(path);
            }
        });
        SetFlaggedMediaPaths(paths);
    };

    const content = () => {
        if (!MediaFiles || MediaFiles.length === 0) {
            IPC.setTitle('Simple Media Player');
            return (<Welcome onOpenDirectory={openDirectoryClick} onOpenFile={openSingleFileClick} />);
        }

        return (<Player filePaths={MediaFiles} onDelete={onDelete} onFlaggedMediaChange={onFlaggedMediaChange} key={MediaHash} />);
    };

    return (
        <React.Fragment>
            <UpdateBanner />
            {content()}
        </React.Fragment>
    );
};
