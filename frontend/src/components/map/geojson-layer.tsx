// geojson-layer.tsx
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

// Assuming the GeoJSON data is available at a URL or as a local file
const geojsonUrl = 'geojsons/limite-intercommunales.geojson'

const polygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(139, 0, 0, 0)' // 5% opacity red fill (#C8102E)
    }),
    stroke: new Stroke({
        color: 'rgba(0, 0, 0, 1)', // Solid red border
        width: 2 // Border width
    })
});

const hoverPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.5)'
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 1 // Border width
    }),
});

const geoJsonLayer  = new VectorLayer({
    source: new VectorSource({
        url: geojsonUrl,
        format: new GeoJSON(),
    }),
    style: polygonStyle,
});

geoJsonLayer.set('title', 'intercommunales');

export { polygonStyle, hoverPolygonStyle };
export default geoJsonLayer;
