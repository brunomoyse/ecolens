// GeoJsonLayer.tsx
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

// Function to create a GeoJSON layer
const createGeoJsonLayer = (
    geoJsonUrl: string,
    title: string,
    polygonStyle: Style = defaultPolygonStyle,
) => {
    const layer = new VectorLayer({
        source: new VectorSource({
            url: geoJsonUrl,
            format: new GeoJSON(),
        }),
        style: polygonStyle,
    });

    layer.set('title', title);

    return layer;
};

// Default styles
const defaultPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(139, 0, 0, 0)'
    }),
    stroke: new Stroke({
        color: 'rgba(0, 0, 0, 1)',
        width: 2
    })
});

export { createGeoJsonLayer, defaultPolygonStyle };
