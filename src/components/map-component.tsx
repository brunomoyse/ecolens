// map-component.tsx
"use client";

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import {useEffect, useState} from 'react';
import {fromLonLat, Projection} from 'ol/proj';

import geoJsonLayer from './map/geojson-layer';
import {useMap} from "@/context/map-context";
import { Pointer as PointerInteraction } from 'ol/interaction';
import { Feature } from 'ol';
import Style from 'ol/style/Style';

import { hoverPolygonStyle } from "./map/geojson-layer";
import { FeatureLike } from "ol/Feature";

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
    const {  map } = useMap(); // Get the setMap function from context

    const [hoverInfo, setHoverInfo] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(null);

    useEffect(() => {
        if (map) {
            console.log('Map is ready');
            // Perform any additional setup or add layers if necessary
            map.setTarget('map');
            map.setLayers([osmLayer, geoJsonLayer]);
            map.setView(namurCenteredView);
        }
    }, [map]);

    useEffect(() => {
        if (map) {
            let hoveredFeature: Feature|null = null;

            map.addInteraction(new PointerInteraction({
                handleMoveEvent: (evt) => {
                    if (hoveredFeature) {
                        hoveredFeature.setStyle(undefined); // Reset style
                        hoveredFeature = null;
                    }

                    map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                        if (layer && layer.get('title') === 'wallonia-pre') {
                            if (feature instanceof Feature) {
                                // Set OL style
                                hoveredFeature = feature;
                                feature.setStyle(hoverPolygonStyle);
                                // Set hover info
                                setHoverInfo(feature.getProperties());
                                setHoverPosition(map.getPixelFromCoordinate(evt.coordinate));
                                return true; // Stop iteration
                            }
                        }
                    });
                }
            }));
        }
    }, [map]);

    return (
        <div id="map" className="map-container min-h-max w-full" />
    );
}
