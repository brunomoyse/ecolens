// Popup.tsx
import React from 'react';

interface DialogMapProps {
    data: { [key: string]: any };
    coordinate: [number, number] | undefined;
}

const DialogMap: React.FC<DialogMapProps> = ({ data, coordinate }) => {
    console.log('IN COMPONENT', data);

    if (!data || !coordinate) return null;

    // Inline style for positioning
    const positionStyle = {
        left: `${coordinate[0]}px`,
        top: `${coordinate[1]}px`,
    };

    return (
        <div style={positionStyle} className="absolute z-10 p-4 bg-white shadow-lg rounded-lg">
            <div className="text-sm">
                N° entreprise: {data.establishment_number}
            </div>
        </div>
    );
};

export default DialogMap;
