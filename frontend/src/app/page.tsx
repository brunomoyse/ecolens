// home.tsx
"use client";

import React, {useState} from 'react';
import MapComponent from "@/components/MapComponent";
import BarButtons from "@/components/panels/BarButtons";
import LayerWidget from "@/components/panels/LayerWidget";
import BottomPanel from "@/components/panels/BottomPanel";
import LegendWidget from "@/components/panels/LegendWidget";

export default function Home() {
    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    const toggleBottomPanel = () => {
        setIsBottomPanelVisible(!isBottomPanelVisible);
    }

    const toggleDrawing = () => {
        setIsDrawing(!isDrawing);
    }

    return (
        <main className="relative flex max-h-screen max-w-screen">
            <BarButtons
                onToggleBottomPanel={toggleBottomPanel}
                onToggleDrawing={toggleDrawing}
            />
            <LayerWidget />
            <LegendWidget />
            <BottomPanel isVisible={isBottomPanelVisible}/>
            <MapComponent isDrawing={isDrawing} />
        </main>
    )
}
