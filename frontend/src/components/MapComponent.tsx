// MapComponent.tsx
'use client';

import 'ol/ol.css';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { useEffect, useRef, useState } from 'react';
import { fromLonLat } from 'ol/proj';
import { useMap } from '@/context/map-context';
import { createEmptyVectorLayerForDrawing } from '@/lib/utils';
import { createVectorTileLayer } from './map/VectorTileLayer';
import { createGeoJsonLayer } from './map/GeoJsonLayer';
import PreviewCard from '@/components/cards/PreviewCard';
import { Enterprise } from '@/types';
import { Draw } from 'ol/interaction';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createGetEnterpriseFeatureStyle } from '@/components/map/styles/EnterpriseFeatureStyle';
import {
	setDrawingCircleState,
	setDrawnCircleCenter,
	setDrawnCircleRadius,
	setDrawnFeature,
} from '@/store/slices/drawingSlice';
import { TileArcGISRest } from 'ol/source';
import {
	fetchCircleSearchResults,
	fetchMapEnterpriseIds,
	setSelectedEnterprises,
} from '@/store/slices/enterpriseSlice';
import { setSelectedEap } from '@/store/slices/eapSlice';
import { WKT } from 'ol/format';
import { fetchGeoPortalLegend } from '@/store/slices/legendSlice';
import { Type } from 'ol/geom/Geometry';
import { createCircleWkt } from '@/lib/utils';
import { Circle, Geometry, Polygon } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import VectorTileLayer from 'ol/layer/VectorTile';
import { setTimeout } from '@wry/context';

// Namur's geographic coordinates (WGS84)
const namurGeoCoords = [4.8717, 50.467];

// Namur's centered view
const namurCenteredView = new View({
	center: fromLonLat(namurGeoCoords),
	zoom: 8.68,
});

const osmLayer = new TileLayer({
	source: new OSM(),
	className: 'osm-layer', // Custom class name
});

export default function MapComponent() {
	const { map, addLayer, layersAdded, setLayersAdded } = useMap();
	const isDrawingPolygon = useAppSelector((state) => state.drawing.isDrawingPolygon);
	const isDrawingCircle = useAppSelector((state) => state.drawing.isDrawingCircle);
	const drawnFeature = useAppSelector((state) => state.drawing.drawnFeature);
	const drawnCircleRadius = useAppSelector((state) => state.drawing.drawnCircleRadius);
	const filterEntityType = useAppSelector((state) => state.enterprise.filterEntityType);
	const filterSector = useAppSelector((state) => state.enterprise.filterSector);
	const filterNace = useAppSelector((state) => state.enterprise.filterNace);
	const filterEap = useAppSelector((state) => state.enterprise.filterEap);
	const mapEnterpriseIds = useAppSelector((state) => state.enterprise.mapEnterpriseIds);
	const drawnCircle = useRef<Circle | null>(null);
	const dispatch = useAppDispatch();

	const [previewCardInfo, setPreviewCardInfo] = useState<Enterprise[] | null>(null);
	const [previewCardCoordinate, setPreviewCardCoordinate] = useState<[number, number] | undefined>(undefined);
	const layersAddedRef = useRef(false);

	const preLayer = createVectorTileLayer(
		`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/geoportail_amenagement_territoire_pre/{z}/{x}/{y}`,
		'PRE',
		'Polygon',
		1,
	);

	useEffect(() => {
		dispatch(
			fetchGeoPortalLegend({
				layerName: 'PRE',
				category: 'AMENAGEMENT_TERRITOIRE',
				subCategory: 'PRE',
			}),
		);

		dispatch(
			fetchGeoPortalLegend({
				layerName: 'Bâtiments relais',
				category: 'INDUSTRIES_SERVICES',
				subCategory: 'HALL_RELAIS',
			}),
		);
	}, [dispatch]);

	const enterpriseLayer = createVectorTileLayer(
		//`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
		`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}enterprises/{z}/{x}/{y}`,
		'Entreprises',
		'Point',
		4,
		14.5,
	);

	const plotLayer = createVectorTileLayer(
		//`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/function_zxy_kbo_hainaut_establishment/{z}/{x}/{y}?type_of_enterprise=Personne%20morale`,
		`${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}wallonia/{z}/{x}/{y}`,
		'Cadastre',
		'Polygon',
		2,
		15.5,
	);
	plotLayer.setVisible(false);

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

	const waterwaysLayer = new TileLayer({
		source: new TileArcGISRest({
			url: 'https://geoservices.wallonie.be/arcgis/rest/services/MOBILITE/VOIESNAVIGABLES/MapServer',
			params: {
				LAYERS: 'show:0,1,2,3',
				zIndex: 3,
			},
		}),
	});
	waterwaysLayer.set('title', 'Voies navigables');
	waterwaysLayer.setVisible(false);

	const intercomLimitsLayer = createGeoJsonLayer(
		'geojsons/limite-intercommunales.geojson',
		'Délimitation intercommunales',
		3,
	);

	useEffect(() => {
		if (!map) return;
		if (isDrawingPolygon || isDrawingCircle) return;

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
	}, [map, isDrawingPolygon, isDrawingCircle, drawnFeature]); // eslint-disable-line

	useEffect(() => {
		if (!map) return;

		// Only add the layers if they haven't been added before
		if (!layersAdded) {
			map.setTarget('map');
			map.setView(namurCenteredView);
			map.setLayers([osmLayer]);

			// Add base layers using addLayer from context
			const layersToAdd = [
				enterpriseLayer,
				preLayer,
				plotLayer,
				intercomLimitsLayer,
				relayBuildingsLayer,
				waterwaysLayer,
			];
			const currentLayersArray = map.getLayers().getArray();

			layersToAdd.forEach((layerToAdd) => {
				const existingLayer = currentLayersArray.find(
					(layer) => layer.get('title') === layerToAdd.get('title'),
				);
				if (!existingLayer) {
					addLayer(layerToAdd);
				}
			});

			// Mark the layers as added
			setLayersAdded(true);
		}
	}, [map]); // eslint-disable-line

	useEffect(() => {
		if (!map) return;

		const createDrawingInteraction = (type: Type) => {
			const vectorSource = new VectorSource();
			const vectorLayer = createEmptyVectorLayerForDrawing(vectorSource);
			vectorLayer.set('title', 'Drawing');
			map.addLayer(vectorLayer);

			const drawInteraction = new Draw({
				source: vectorSource,
				type: type,
			});
			map.addInteraction(drawInteraction);

			drawInteraction.on('drawend', (event) => {
				let wktString = '';
				const featureCopy = event.feature.clone();
				const featureGeometry = featureCopy.getGeometry();

				if (featureGeometry && featureGeometry instanceof Polygon) {
					featureGeometry!.transform('EPSG:3857', 'EPSG:4326');
					const wktFormat = new WKT();
					wktString = wktFormat.writeFeature(featureCopy, {
						dataProjection: 'EPSG:4326',
						featureProjection: 'EPSG:4326',
					});
					dispatch(setDrawnFeature(wktString));
				} else if (featureGeometry instanceof Circle) {
					// Set radius/center in meters for the FE
					let radius = featureGeometry.getRadius();
					let center = featureGeometry.getCenter();
					dispatch(setDrawnCircleCenter(center));
					dispatch(setDrawnCircleRadius(radius));

					// Set the local state
					drawnCircle.current = featureGeometry;

					// Transform to WKT for the backend
					wktString = createCircleWkt(event.feature);
					dispatch(fetchCircleSearchResults({ wkt: wktString }));
					dispatch(setDrawnFeature(wktString));
				}

				map.removeInteraction(drawInteraction);
			});
		};

		const toggleDrawingInteraction = (isDrawing: boolean, type: Type) => {
			const drawingInteraction = map
				.getInteractions()
				.getArray()
				.find((interaction) => interaction instanceof Draw && interaction.get('type') === type);

			if (isDrawing && !drawingInteraction) {
				createDrawingInteraction(type);
			} else if (!isDrawing && drawingInteraction) {
				map.removeInteraction(drawingInteraction);
			}
		};

		toggleDrawingInteraction(isDrawingPolygon, 'Polygon');
		toggleDrawingInteraction(isDrawingCircle, 'Circle');

		return () => {
			const drawingInteractions = map
				.getInteractions()
				.getArray()
				.filter((interaction) => interaction instanceof Draw);
			drawingInteractions.forEach((interaction) => map.removeInteraction(interaction));
		};
	}, [dispatch, isDrawingPolygon, isDrawingCircle, map]);

	useEffect(() => {
		if (!map || !drawnCircle.current || !drawnCircleRadius) return;

		// Filter to find the vector layer with title 'Drawing'
		const vectorLayers = map
			.getLayers()
			.getArray()
			.filter((layer): layer is VectorLayer<VectorSource> => {
				return layer instanceof VectorLayer && layer.get('title') === 'Drawing';
			});

		if (vectorLayers.length > 0) {
			const vectorLayer = vectorLayers[0];
			const source = vectorLayer.getSource();
			const features = source?.getFeatures() ?? [];

			// Find the specific circle feature
			const circleFeature = features[0];

			if (circleFeature) {
				const circleGeometry = circleFeature.getGeometry();
				if (circleGeometry instanceof Circle) {
					// Update the circle's radius with the new value from the store
					circleGeometry.setRadius(drawnCircleRadius);

					const wktString = createCircleWkt(circleFeature);
					dispatch(setDrawnFeature(wktString));
				}
			}
		}
	}, [drawnCircleRadius]);

	useEffect(() => {
		if (!map) return;

		const enterpriseLayer = map
			.getLayers()
			.getArray()
			.find((l) => l.get('title') === 'Entreprises') as VectorTileLayer;
		if (!enterpriseLayer) return;

		const currentZoom = map.getView().getZoom() as number;
		// if zoom level is less than 14, hide the enterprise layer
		if (currentZoom >= 14.5) {
			const args = {
				filterEap: filterEap,
				filterNace: filterNace,
				filterEntityType: filterEntityType,
				filterSector: filterSector,
			};

			dispatch(fetchMapEnterpriseIds({ ...args }));
		}
	}, [map, filterNace, filterEap, filterEntityType, filterSector]);

	useEffect(() => {
		if (!map) return;
		const enterpriseLayer = map
			.getLayers()
			.getArray()
			.find((l) => l.get('title') === 'Entreprises') as VectorTileLayer;
		if (!enterpriseLayer) return;

		if (mapEnterpriseIds.length > 0) {
			enterpriseLayer.setStyle(
				createGetEnterpriseFeatureStyle({
					mapEnterpriseIds: new Set(mapEnterpriseIds),
				}),
			);
		}
	}, [map, mapEnterpriseIds]);

	return (
		<div id="map" className="h-screen w-screen">
			{map && previewCardCoordinate && <PreviewCard coordinate={previewCardCoordinate} />}
		</div>
	);
}
