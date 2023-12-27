// map-component.tsx
"use client";

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import { useMap } from "@/context/map-context";

import vectorTileLayer, { polygonStyle, selectedPolygonStyle } from './map/vector-tile-layer';

// Namur's geographic coordinates (WGS84)
const namurGeoCoords = [4.8717, 50.4670];

// Namur's centered view
const namurCenteredView = new View({
    center: fromLonLat(namurGeoCoords),
    zoom: 8
});

const osmLayer = new TileLayer({
    source: new OSM(),
    className: 'osm-layer' // Custom class name
});

export default function MapComponent() {
    const { map } = useMap();
    const [selectedFeatureId, setSelectedFeatureId] = useState(null);

    useEffect(() => {
        if (!map) return;

        map.setTarget('map');
        map.setLayers([osmLayer, vectorTileLayer]);
        map.setView(namurCenteredView);

        // Click interaction
        map.on('click', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === vectorTileLayer) {
                    const gid = feature.getProperties()?.gid;
                    setSelectedFeatureId(gid);
                }
            });
        });
    }, [map]);

    useEffect(() => {
        vectorTileLayer.setStyle(function(feature) {
            if (feature.getProperties()?.gid === selectedFeatureId) {
                return selectedPolygonStyle;
            }
            return polygonStyle;
        });

        vectorTileLayer.changed(); // Force layer redraw
    }, [selectedFeatureId]);

    return (
        <div id="map" className="map-container min-h-max w-full" />
    );
}
