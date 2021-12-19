import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
    faFlag,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';

export namespace Icon {
    interface IconProps {
        pulse?: boolean;
        spin?: boolean;
        title?: string;
    }

    interface EIconProps {
        icon: IconProp;
        options: IconProps;
    }

    export const EIcon: React.FC<EIconProps> = (props: EIconProps) => {
        return (<FontAwesomeIcon icon={props.icon} pulse={props.options.pulse} spin={props.options.spin} title={props.options.title} />);
    };

    export const Flag: React.FC<IconProps> = (props: IconProps) => EIcon({ icon: faFlag, options: props });
    export const Times: React.FC<IconProps> = (props: IconProps) => EIcon({ icon: faTimes, options: props });
}
