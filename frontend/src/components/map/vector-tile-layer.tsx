import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT.js';

const vectorTileLayer = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
      format: new MVT(),
      url:
      `${process.env.NEXT_PUBLIC_MAP_SERVER_ENDPOINT!}/pae_occupes_charleroi/{z}/{x}/{y}`
    })
});

export default vectorTileLayer;