// VectorTileLayer.tsx
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";

// Function to create a Vector Tile Layer
const createVectorTileLayer = (
    url: string,
    title: string,
    style: Style,
    minZoom: number = 6,
) => {
    const layer = new VectorTileLayer({
        declutter: true,
        source: new VectorTileSource({
            format: new MVT(),
            url: url
        }),
        minZoom: minZoom,
        style: style
    });

    layer.set('title', title);

    return layer;
};

// Default styles
const defaultPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(211, 255, 190, 0.2)'
    }),
    stroke: new Stroke({
        color: 'rgba(168, 111, 0, 1)',
        width: 2
    })
});

const defaultPointStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.5)' // Red fill color for points
        }),
        stroke: new Stroke({
            color: '#ff0000', // Red stroke color
            width: 1
        })
    })
});

export { createVectorTileLayer, defaultPolygonStyle, defaultPointStyle };
