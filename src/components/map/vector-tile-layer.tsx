import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT.js';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

const polygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.05)' // 5% opacity red fill (#C8102E)
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 1 // Border width
    })
});

const selectedPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.5)' // (#C8102E)
    }),
    stroke: new Stroke({
        color: '#C8102E', // Solid red border
        width: 1 // Border width
    })
});

const vectorTileLayer = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
        format: new MVT(),
        url: `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/pae_occupes_charleroi/{z}/{x}/{y}`,
    }),
    style: polygonStyle
});


vectorTileLayer.set('title', 'pae-charleroi');

export { polygonStyle, selectedPolygonStyle }
export default vectorTileLayer;
