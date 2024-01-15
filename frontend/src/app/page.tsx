// home.tsx
"use client";

import React, { useState } from 'react';
import MapComponent from "@/components/MapComponent";
import BarButtons from "@/components/panels/BarButtons";
import LeftPanel from "@/components/panels/LeftPanel";
import BottomPanel from "@/components/panels/BottomPanel";

export default function Home() {
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
    const [isButtonBarUp, setIsButtonBarUp] = useState(false);

    const toggleLeftPanel = () => {
        if (isBottomPanelVisible) {
            // Hide bottom panel
            setIsBottomPanelVisible(false);
            // Move back the buttons bar
            setIsButtonBarUp(false);
        }
        setIsLeftPanelVisible(!isLeftPanelVisible);
    }

    const toggleBottomPanel = () => {
        // If becomes visible,
        if (!isBottomPanelVisible) {
            // Force to hide left panel
            setIsLeftPanelVisible(false);
            // Move up the buttons bar
            setIsButtonBarUp(true);
        } else {
            // Move back the buttons bar
            setIsButtonBarUp(false);
        }
        setIsBottomPanelVisible(!isBottomPanelVisible);
    }

    return (
        <main className="flex min-h-screen max-h-screen">
            <BarButtons
                onToggleLeftPanel={toggleLeftPanel}
                onToggleBottomPanel={toggleBottomPanel}
                isButtonsBarUp={isButtonBarUp}
            />
            <LeftPanel isVisible={isLeftPanelVisible} />
            <BottomPanel isVisible={isBottomPanelVisible}/>
            <MapComponent/>
        </main>
    )
}
