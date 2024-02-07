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
import { createVectorTileLayer, defaultPolygonStyle, defaultPointStyle } from './map/VectorTileLayer';
import { createGeoJsonLayer } from "./map/GeoJsonLayer";
import PreviewCard from "@/components/cards/PreviewCard";
import {enterpriseDetails} from "@/types";
import {Draw} from "ol/interaction";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON';
import {Geometry} from "ol/geom";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {toggleDrawing, toggleDrawn} from "@/store/slices/drawingSlice";
import {TileArcGISRest} from "ol/source";
import {Style, Text} from "ol/style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {Feature, } from "ol";

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
    const dispatch = useAppDispatch();

    const [selectedPre, setSelectedPre] = useState< { [x: string]: any; }|null>(null);
    const [selectedEnterprise, setSelectedEnterprise] = useState< { [x: string]: any; }|null>(null);

    const [previewCardInfo, setPreviewCardInfo] = useState<enterpriseDetails|null>(null);
    const [previewCardCoordinate, setPreviewCardCoordinate] = useState<[number, number] | undefined>(undefined);



    const preLayer = createVectorTileLayer(
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/geoportail_amenagement_territoire_pre/{z}/{x}/{y}`,
        'PRE',
        'Polygon',
        1
    )

    const enterpriseLayer = createVectorTileLayer(
        //`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}hainaut_establishment_view/{z}/{x}/{y}`,
        'Entreprises',
        'Point',
        4,
        14
    )

    const plotLayer = createVectorTileLayer(
        //`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
        `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}wallonia/{z}/{x}/{y}`,
        'Parcelles cadastrales',
        'Polygon',
        2,
        15
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
    }, [map]); // eslint-disable-line

    const addDrawingInteraction = () => {
        if (map) {

            // Remove the draw interaction if it already exists
            map.getInteractions().forEach((interaction) => {
                if (interaction instanceof Draw) {
                    map.removeInteraction(interaction);
                }
            });

            // Remove the vector layer if it already exists
            map.getLayers().forEach((layer) => {
                if (layer.get('title') === 'Drawing') {
                    map.removeLayer(layer);
                }
            });

            // Create a new vector source for drawing
            let vectorSource = new VectorSource();

            // Create a vector layer and assign the source to it
            let vectorLayer = createEmptyVectorLayerForDrawing(vectorSource);
            vectorLayer.set('title', 'Drawing');

            // Add the vector layer to the map, not the vector source directly
            map.addLayer(vectorLayer);

            // Initialize the Draw interaction with the vector source
            const draw = new Draw({
                source: vectorSource, // This should be the vector source
                type: 'Polygon', // The geometry type to draw
            });

            // Add the draw interaction to the map
            map.addInteraction(draw);

            // Add a listener for the drawend event to log the feature's geometry and remove the draw interaction
            draw.on('drawend', (event) => {
                if (event.feature) {
                    // Initialize GeoJSON format
                    const format = new GeoJSON();

                    const drawGeometry = event.feature.getGeometry() as Geometry;

                    // Write the feature's geometry to a GeoJSON string
                    const geoJson = format.writeGeometry(drawGeometry);

                    console.log(geoJson);
                }

                // Remove the draw interaction from the map after drawing is complete
                map.removeInteraction(draw);

                // Toggle store drawing state
                dispatch(toggleDrawing());
                dispatch(toggleDrawn())
            });
        }
    };

    if (map && isDrawing) {
        addDrawingInteraction();
    } else {
        map?.getInteractions().forEach((interaction) => {
            if (interaction instanceof Draw) {
                map.removeInteraction(interaction);
            }
        });
    }

    return (
        <div id="map" className="h-screen w-screen">
            {map && previewCardInfo && previewCardCoordinate && <PreviewCard data={previewCardInfo} coordinate={previewCardCoordinate}/>}
        </div>);

}
