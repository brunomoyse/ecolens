// home.tsx
"use client";

import MapComponent from "@/components/map-component";
import LeftPanel from "@/components/panels/left-panel";
import BottomButtons from "@/components/panels/bottom-buttons";

export default function Home() {
    return (
        <main className="flex min-h-screen max-h-screen">
            <BottomButtons/>
            <LeftPanel/>
            <MapComponent/>
        </main>
    )
}
