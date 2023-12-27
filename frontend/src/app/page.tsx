// home.tsx
"use client";

import MapComponent from "@/components/map-component";
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import {useState} from 'react';
import {useMap} from "@/context/map-context";

export default function Home() {
    const { map } = useMap(); // Assuming you are using the MapContext
    const [isLayerVisible, setIsLayerVisible] = useState(true);

    // Toggle function to show/hide layers
    const toggleLayerVisibility = () => {
        if (!map) return;
        setIsLayerVisible(!isLayerVisible);
        const geoJsonLayer = map.getLayers().getArray()
            .find(layer => layer.get('title') === 'wallonia-pre');
        if (geoJsonLayer) {
            geoJsonLayer.setVisible(!isLayerVisible);
        }
    };
    return (
    <main className="flex min-h-screen max-h-screen">
        <aside className="w-1/4 bg-gray-200 p-4 shadow-lg">
            <h2 className="text-2xl font-bold text-center my-4">Layers</h2>
            <div className="space-y-4">
                <div onClick={toggleLayerVisibility} className="flex items-center p-2 hover:bg-gray-300 rounded-lg cursor-pointer">
                    <span className="ml-2">PRE</span>
                    <button  className="ml-auto">
                        {/* Toggle Icon */}
                        {isLayerVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                </div>
            </div>
        </aside>
        <MapComponent />
    </main>
  )
}
