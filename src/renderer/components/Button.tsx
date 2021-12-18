import * as React from 'react';
import '../../../css/Button.scss';

export interface ButtonProps {
    onClick: () => (void);
    disabled?: boolean;
    children?: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
    return (
        <button type="button" className="btn" onClick={props.onClick} disabled={props.disabled}>
            {props.children}
        </button>
    );
};
