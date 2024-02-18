// home.tsx
"use client";

import MapComponent from "@/components/MapComponent";
import BarButtons from "@/components/panels/BarButtons";
import LayerWidget from "@/components/panels/LayerWidget";
import BottomPanel from "@/components/panels/BottomPanel";
import SelectedEnterpriseWidget from "@/components/cards/SelectedEnterpriseWidget";

export default function Home() {
    return (
        <main className="relative flex max-h-screen max-w-screen">
            <BarButtons />
            <LayerWidget />
            <SelectedEnterpriseWidget />
            <BottomPanel />
            <MapComponent />
        </main>
    )
}
