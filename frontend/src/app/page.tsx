// home.tsx
"use client";

import React, {useState} from 'react';
import MapComponent from "@/components/MapComponent";
import BarButtons from "@/components/panels/BarButtons";
import LayerWidget from "@/components/panels/LayerWidget";
import BottomPanel from "@/components/panels/BottomPanel";
import {useDraggable} from "@/lib/utils";
import LegendWidget from "@/components/panels/LegendWidget";

export default function Home() {
    useDraggable('layer-widget', 'drag-layer-widget');
    useDraggable('legend-widget', 'legend-widget');

    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);

    const toggleBottomPanel = () => {
        setIsBottomPanelVisible(!isBottomPanelVisible);
    }

    // @ts-ignore
    return (
        <main className="relative flex max-h-screen max-w-screen">
            <BarButtons
                onToggleBottomPanel={toggleBottomPanel}
            />
            <LayerWidget />
            <LegendWidget />
            <BottomPanel isVisible={isBottomPanelVisible}/>
            <MapComponent/>
        </main>
    )
}
