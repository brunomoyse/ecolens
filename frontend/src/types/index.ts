interface geoPortalService {
    name: string,
    type: string
}

interface legendArcGis {
    layers: legendArcGisLayer[]
}

interface legendArcGisLayer {
    layerId: Number,
    layerName: string,
    layerType: string,
    minScale: Number,
    maxScale: Number,
    legend: legendArcGisLayerLegend[]
}

interface legendArcGisLayerLegend {
    label: string
    url: string,
    imageData: string,
    contentType: string,
    height: Number,
    width: Number,
    values: string[]
}

export type { legendArcGis, geoPortalService };
