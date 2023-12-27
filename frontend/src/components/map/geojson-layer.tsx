// geojson-layer.tsx
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

// Assuming the GeoJSON data is available at a URL or as a local file
const geojsonUrl = 'geojsons/wallonia-pre.geojson'

const polygonGreenStyle = new Style({
    fill: new Fill({
        color: 'rgba(46, 198, 16, 0.05)' // 5% opacity red fill (#C8102E)
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 2 // Border width
    })
});

const polygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.05)' // 5% opacity red fill (#C8102E)
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 2 // Border width
    })
});

const hoverPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.5)' // (#C8102E)
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 2 // Border width
    })
});

// Define a function that returns a style based on feature properties
const getFeatureStyle = (feature: any) => {
    // Access a property of the feature. Replace 'yourProperty' with your actual property name.
    const propertyValue = feature.get('NATURE');

    // Droit de préemption
    if (propertyValue === 'DRPRE') {
        return polygonGreenStyle;
    // Périmètre d'expropriation
    } else if (propertyValue === 'PEX') {
        return polygonGreenStyle;
    } else {
        // Default style
        return polygonStyle;
    }
};

const geoJsonLayer  = new VectorLayer({
    source: new VectorSource({
        url: geojsonUrl,
        format: new GeoJSON(),
    }),
    style: getFeatureStyle,
});

geoJsonLayer.set('title', 'wallonia-pre');

export { polygonStyle, hoverPolygonStyle };
export default geoJsonLayer;
