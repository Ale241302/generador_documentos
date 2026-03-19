import React from 'react';

interface WatermarkOverlayProps {
    text: string | null;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ text }) => {
    if (!text) return null;

    const isLongText = text.length > 10;

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: isLongText ? '60px' : '80px',
                fontFamily: "'Roboto Condensed', sans-serif",
                fontWeight: 'bold',
                color: 'rgba(240, 110, 0, 0.18)',
                letterSpacing: '8px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 9999,
            }}
        >
            {text}
        </div>
    );
};
