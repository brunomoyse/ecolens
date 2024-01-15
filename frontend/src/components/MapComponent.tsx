// MapComponent.tsx
"use client";

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import { useMap } from "@/context/map-context";

import { createVectorTileLayer, defaultPolygonStyle, defaultPointStyle } from './map/VectorTileLayer';
import { createGeoJsonLayer } from "./map/GeoJsonLayer";
import DialogMap from "@/components/cards/PreviewCard";
import {enterpriseDetails} from "@/types";

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
    const [selectedPre, setSelectedPre] = useState< { [x: string]: any; }|null>(null);
    const [selectedEnterprise, setSelectedEnterprise] = useState< { [x: string]: any; }|null>(null);

    const [previewCardInfo, setPreviewCardInfo] = useState<enterpriseDetails|null>(null);
    const [previewCardCoordinate, setPreviewCardCoordinate] = useState<[number, number] | undefined>(undefined);

    const preLayer = createVectorTileLayer(
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/geoportail_amenagement_territoire_pre/{z}/{x}/{y}`,
        'PRE',
        defaultPolygonStyle
    )

    const enterpriseLayer = createVectorTileLayer(
        //`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}hainaut_establishment_view/{z}/{x}/{y}`,
        'Entreprises',
        defaultPointStyle,
        14
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
        addLayer(intercomLimitsLayer);
        addLayer(preLayer);
        addLayer(enterpriseLayer);

        // Click interaction
        map.on('click', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === preLayer) {
                    setSelectedPre(feature.getProperties());
                } else if (layer === enterpriseLayer) {
                    setSelectedEnterprise(feature.getProperties());
                    setPreviewCardInfo(feature.getProperties() as enterpriseDetails);
                    const pixel = map.getPixelFromCoordinate(evt.coordinate);
                    if (pixel) {
                        setPreviewCardCoordinate([pixel[0], pixel[1]]);
                    } else {
                        setPreviewCardCoordinate(undefined);
                    }
                }
            });
        });

        map.on('movestart', function () {
            // Reset the selected feature when the map is moved
            setPreviewCardInfo(null);
            setPreviewCardCoordinate(undefined);
        });
    }, [map]);

    return (
        <div id="map" className="map-container min-h-max w-full">
            {map && previewCardInfo && <DialogMap data={previewCardInfo} coordinate={previewCardCoordinate}/>}
        </div>);

}
