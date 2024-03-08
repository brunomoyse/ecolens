// map-context.tsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import Map from 'ol/Map';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import BaseLayer from "ol/layer/Base";

// Define the EPSG:31370 projection using proj4
proj4.defs('EPSG:31370', '+proj=lcc +lat_1=49.8333339 +lat_2=51.16666723333333 +lat_0=90 +lon_0=4.356939722222222 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs');
register(proj4);

interface MapContextProps {
    map: Map | null;
    setMap: React.Dispatch<React.SetStateAction<Map | null>>;
    layers: BaseLayer[];
    addLayer: (layer: BaseLayer) => void;
    removeLayer: (layer: BaseLayer) => void;
    toggleLayerVisibility: (layer: BaseLayer) => void;
    setLayersAdded: React.Dispatch<React.SetStateAction<boolean>>;
    layersAdded: boolean;
}

const MapContext = createContext<MapContextProps | null>(null);

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};

// Define a type for the props
interface MapProviderProps {
    children: React.ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
    const [map, setMap] = useState<Map | null>(null);
    const [layers, setLayers] = useState<BaseLayer[]>([]);
    const [layersAdded, setLayersAdded] = useState(false);

    // Functions to add and remove layers
    const addLayer = (layer: BaseLayer) => {
        if (map && !layers.includes(layer)) {
            map.addLayer(layer);
            setLayers(prev => [...prev, layer]);
        }
    };

    const removeLayer = (layer: BaseLayer) => {
        if (map) {
            map.removeLayer(layer);
            setLayers(prev => prev.filter(l => l !== layer));
        }
    };

    const toggleLayerVisibility = (layer: BaseLayer) => {
        if (!layer) return;

        // Toggle the layer's visibility
        layer.setVisible(!layer.getVisible());

        // Trigger a state update to re-render components
        setLayers(layers => [...layers]);
    };

    useEffect(() => {
        const mapInstance = new Map({});

        setMap(mapInstance);

        return () => {
            if (mapInstance) {
                mapInstance.setTarget(undefined);
            }
            setMap(null);
        };
    }, []);
    return (
        <MapContext.Provider value={{ map, setMap, layers, addLayer, removeLayer, toggleLayerVisibility, setLayersAdded, layersAdded }}>
            {children}
        </MapContext.Provider>
    );
};
