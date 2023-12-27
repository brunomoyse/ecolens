import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT.js';

const vectorTileLayer = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
      format: new MVT(),
      url:
      'http://141.94.31.3:4000/pae_occupes_charleroi/{z}/{x}/{y}'
    })
});

export default vectorTileLayer;