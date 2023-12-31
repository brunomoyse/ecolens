// MapComponent.tsx
"use client";

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import { useMap } from "@/context/map-context";

import { createVectorTileLayer, defaultSelectedPolygonStyle, defaultPolygonStyle } from './map/VectorTileLayer';
import { createGeoJsonLayer } from "./map/GeoJsonLayer";

// Namur's geographic coordinates (WGS84)
const namurGeoCoords = [4.8717, 50.4670];

// Namur's centered view
const namurCenteredView = new View({
    center: fromLonLat(namurGeoCoords),
    zoom: 8.68
});

const osmLayer = new TileLayer({
    source: new OSM(),
    className: 'osm-layer' // Custom class name
});

export default function MapComponent() {
    const { map, addLayer } = useMap();
    const [selectedFeatureId, setSelectedFeatureId] = useState(null);

    const paeLayer = createVectorTileLayer(
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/pae_occupes_charleroi/{z}/{x}/{y}`,
        'Parc d\'activités'
    )

    const intercomLimitsLayer = createGeoJsonLayer(
        'geojsons/limite-intercommunales.geojson',
        'Délimitation intercommunales',
    );

    useEffect(() => {
        if (!map) return;

        map.setTarget('map');
        map.setView(namurCenteredView);
        map.setLayers([osmLayer]);

        // Add base layers using addLayer from context
        addLayer(paeLayer);
        addLayer(intercomLimitsLayer);

        // Click interaction
        map.on('click', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === paeLayer) {
                    const gid = feature.getProperties()?.gid;
                    setSelectedFeatureId(gid);
                }
            });
        });
    }, [map]);

    useEffect(() => {
        paeLayer.setStyle(function(feature) {
            if (feature.getProperties()?.gid === selectedFeatureId) {
                return defaultSelectedPolygonStyle;
            }
            return defaultPolygonStyle;
        });

        paeLayer.changed(); // Force layer redraw
    }, [selectedFeatureId]);

    return (
        <div id="map" className="map-container min-h-max w-full" />
    );
}
