// home.tsx
"use client";

import React, { useState } from 'react';
import MapComponent from "@/components/MapComponent";
import BarButtons from "@/components/panels/BarButtons";
import LeftPanel from "@/components/panels/LeftPanel";

export default function Home() {
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);

    const toggleLeftPanel = () => {
        setIsLeftPanelVisible(!isLeftPanelVisible);
    }

    return (
        <main className="flex min-h-screen max-h-screen">
            <BarButtons onToggleLeftPanel={toggleLeftPanel} />
            <LeftPanel isVisible={isLeftPanelVisible} />
            <MapComponent/>
        </main>
    )
}
