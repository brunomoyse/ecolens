import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

// Function to create a Vector Tile Layer
const createVectorTileLayer = (
    url: string,
    title: string,
    polygonStyle: Style = defaultPolygonStyle,
) => {
    const layer = new VectorTileLayer({
        declutter: true,
        source: new VectorTileSource({
            format: new MVT(),
            url: url
        }),
        style: polygonStyle
    });

    layer.set('title', title);

    return layer;
};

// Default styles
const defaultPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.05)'
    }),
    stroke: new Stroke({
        color: '#C8102E',
        width: 1
    })
});

const defaultSelectedPolygonStyle = new Style({
    fill: new Fill({
        color: 'rgba(200, 16, 46, 0.5)'
    }),
    stroke: new Stroke({
        color: '#C8102E',
        width: 1
    })
});

export { createVectorTileLayer, defaultPolygonStyle, defaultSelectedPolygonStyle };
