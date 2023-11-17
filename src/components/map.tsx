"use client";

import 'ol/ol.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect } from 'react';
import {fromLonLat, Projection} from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { get as getProjection } from 'ol/proj';

// Define the EPSG:31370 projection using proj4
proj4.defs('EPSG:31370', '+proj=lcc +lat_1=49.8333339 +lat_2=51.16666723333333 +lat_0=90 +lon_0=4.356939722222222 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs');
register(proj4);

// const belgianLambert72Projection = getProjection('EPSG:31370') as Projection;
// if (!belgianLambert72Projection) {
//     throw new Error('EPSG:31370 projection is not defined');
// }

// Namur's geographic coordinates (WGS84)
const namurGeoCoords = [4.8717, 50.4670];

export default function MapComponent() {
    useEffect(() => {
        const map = new Map({
            layers: [
                new TileLayer({source: new OSM()}),
            ],
            target: 'map',
            view: new View({
                center: fromLonLat(namurGeoCoords),
                zoom: 8
            })
        });

        return () => map.setTarget(undefined); // cleanup function to avoid multiple rendered maps
    }, []);

    return (
        <div id="map" className="map-container min-h-max w-full" />
    );
}
