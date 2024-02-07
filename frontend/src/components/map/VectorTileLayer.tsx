// VectorTileLayer.tsx
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import {getPaeFeatureStyle} from "@/components/map/styles/PaeFeatureStyle";

// Function to create a Vector Tile Layer
const createVectorTileLayer = (
    url: string,
    title: string,
    form: string,
    zIndex: number,
    customStyle?: Style,
    minZoom?: number,
) => {
    const getStyle = title === 'PRE' ? getPaeFeatureStyle : customStyle ? customStyle : form === 'Polygon' ? defaultPolygonStyle : defaultPointStyle;

    const layer = new VectorTileLayer({
        source: new VectorTileSource({
            format: new MVT(),
            url: url
        }),
        zIndex: zIndex,
        minZoom: minZoom,
        style: getStyle,
    });

    layer.set('title', title);

    return layer;
};

// Default styles
const defaultPolygonStyle = new Style({
    stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.6)',
        width: 1
    })
});

const defaultPointStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.8)' // Red fill color for points
        }),
        stroke: new Stroke({
            color: '#ff0000', // Red stroke color
            width: 1
        })
    })
});

export { createVectorTileLayer, defaultPolygonStyle, defaultPointStyle };
