import React from 'react';

import './styles.scss';

type ButtonProps = {
    text: string,
    onClick: () => void,
}

type ButtonsPanelProps = {
    buttons: ButtonProps[],
}

const ButtonsPanel = ({buttons}: ButtonsPanelProps) => {
    return (
        <div className="buttons-panel">
            {buttons.map((button, idx) => (
                <div className="buttons-panel__button-wrapper" key={idx}>
                    <button onClick={button.onClick}>
                        {button.text}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ButtonsPanel;
