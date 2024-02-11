// MapComponent.tsx
"use client";

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import { useMap } from "@/context/map-context";
import { createEmptyVectorLayerForDrawing } from "@/lib/utils";
import { createVectorTileLayer } from './map/VectorTileLayer';
import { createGeoJsonLayer } from "./map/GeoJsonLayer";
import PreviewCard from "@/components/cards/PreviewCard";
import { Enterprise } from "@/types";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDrawnFeature } from "@/store/slices/drawingSlice";
import { TileArcGISRest } from "ol/source";
import { setSelectedEnterprises } from "@/store/slices/enterpriseSlice";
import { setSelectedEap } from "@/store/slices/eapSlice";
import { WKT } from "ol/format";
import { fetchGeoPortalLegend } from "@/store/slices/legendSlice";

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
    const isDrawing = useAppSelector((state) => state.drawing.isDrawing);
    const drawnFeature = useAppSelector((state) => state.drawing.drawnFeature);
    const dispatch = useAppDispatch();

    const [previewCardInfo, setPreviewCardInfo] = useState<Enterprise[]|null>(null);
    const [previewCardCoordinate, setPreviewCardCoordinate] = useState<[number, number] | undefined>(undefined);

    const preLayer = createVectorTileLayer(
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/geoportail_amenagement_territoire_pre/{z}/{x}/{y}`,
        'PRE',
        'Polygon',
        1
    )

    useEffect(() => {
        dispatch(
            fetchGeoPortalLegend({
                layerName: 'PRE',
                category: 'AMENAGEMENT_TERRITOIRE',
                subCategory: 'PRE'
            })
        );

        dispatch(
            fetchGeoPortalLegend({
                layerName: 'Bâtiments relais',
                category: 'INDUSTRIES_SERVICES',
                subCategory: 'HALL_RELAIS'
            })
        );
    }, [dispatch]);

    const enterpriseLayer = createVectorTileLayer(
        //`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}hainaut_establishment_view/{z}/{x}/{y}`,
        'Entreprises',
        'Point',
        4,
        14.5
    )

    const plotLayer = createVectorTileLayer(
        //`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}wallonia/{z}/{x}/{y}`,
        'Cadastre',
        'Polygon',
        2,
        15.5
    )

    const relayBuildingsLayer = new TileLayer({
        source: new TileArcGISRest({
            url: 'https://geoservices.wallonie.be/arcgis/rest/services/INDUSTRIES_SERVICES/HALL_RELAIS/MapServer',
            params: {
                LAYERS: 'show:0',
                minZoom: 22,
                zIndex: 5,
            },
        }),
    });
    relayBuildingsLayer.set('title', 'Bâtiments relais');
    relayBuildingsLayer.setVisible(false);

    const intercomLimitsLayer = createGeoJsonLayer(
        'geojsons/limite-intercommunales.geojson',
        'Délimitation intercommunales',
        3
    );

    const toggleDrawingInteraction = () => {
        if (!map) return;
        const drawingInteraction = map.getInteractions().getArray().find(interaction => interaction instanceof Draw);

        if (isDrawing && !drawingInteraction) {
            // Add drawing interaction
            const vectorSource = new VectorSource();
            const vectorLayer = createEmptyVectorLayerForDrawing(vectorSource);
            vectorLayer.set('title', 'Drawing');
            map.addLayer(vectorLayer);

            const drawInteraction = new Draw({
                source: vectorSource,
                type: 'Polygon',
            });
            map.addInteraction(drawInteraction);
            drawInteraction.on('drawend', (event) => {
                if (event.feature) {
                    // Initialize WKT format
                    const wktFormat = new WKT();

                    // Write the drawn feature's geometry to a WKT string
                    const wktString = wktFormat.writeFeature(event.feature);

                    // Dispatch the WKT string or handle it as needed
                    dispatch(setDrawnFeature(wktString));

                    // Remove the draw interaction after drawing is complete
                    map.removeInteraction(drawInteraction);
                }

            });
        } else if (!isDrawing && drawingInteraction) {
            // Remove drawing interaction
            map.removeInteraction(drawingInteraction);
        }
    };

    useEffect(() => {
        if (!map) return;
        if (isDrawing) return;

        // Click interaction
        map.on('click', function (evt) {
            const selectingEnterpriseFeatures: Enterprise[] = [];

            const pixel = map.getPixelFromCoordinate(evt.coordinate);
            if (pixel) {
                setPreviewCardCoordinate([pixel[0], pixel[1]]);
            }

            map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                if (layer === preLayer) {
                    dispatch(setSelectedEap(feature.getProperties()));
                } else if (layer === enterpriseLayer) {
                    selectingEnterpriseFeatures.push(feature.getProperties() as Enterprise);
                }
            });
            dispatch(setSelectedEnterprises(selectingEnterpriseFeatures));
        });

        map.on('movestart', function () {
            // Reset the selected feature when the map is moved
            setPreviewCardCoordinate(undefined);
        });
    }, [map, isDrawing, drawnFeature]); // eslint-disable-line


    useEffect(() => {
        if (!map) return;

        map.setTarget('map');
        map.setView(namurCenteredView);
        map.setLayers([osmLayer]);

        // Add base layers using addLayer from context
        addLayer(enterpriseLayer);
        addLayer(relayBuildingsLayer);
        addLayer(preLayer);
        addLayer(intercomLimitsLayer);
        addLayer(plotLayer);
    }, [map]); // eslint-disable-line

    useEffect(() => {
        // This effect could solely be responsible for managing the drawing interaction
        // based on the `isDrawing` state.
        if (!map) return;

        toggleDrawingInteraction();

        // Cleanup function
        return () => {
            const drawingInteraction = map.getInteractions().getArray().find(interaction => interaction instanceof Draw);
            if (drawingInteraction) {
                map.removeInteraction(drawingInteraction);
            }
        };
    }, [map, isDrawing]); // Dependency on `isDrawing` to re-evaluate when it changes

    return (
        <div id="map" className="h-screen w-screen">
            {map && previewCardCoordinate && <PreviewCard coordinate={previewCardCoordinate}/>}
        </div>);

}
