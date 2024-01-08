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

interface enterpriseDetails {
    box: string|null,
    denomination: string,
    enterprise_number: string,
    establishment_number: string,
    extra_address_info: string|null,
    house_number: string|null,
    layer: string,
    municipality: string|null,
    start_date: string|null,
    street: string|null,
    type_of_denomination: string|null,
    zip_code: string|null
    type_of_enterprise: string|null,
}

export type { legendArcGis, geoPortalService, enterpriseDetails };
