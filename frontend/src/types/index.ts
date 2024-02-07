import {Geometry} from "ol/geom";

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

// To replace with Enterprise
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

interface Enterprise {
    id: string,
    establishment_number: string,
    enterprise_number: string,
    name: string,
    name_commercial: string,
    name_short: string,
    form: string,
    start_date: string,
    nace_main: string,
    nace_other: string[],
    sector: string,
    address_extra: string,
    address_id: string,
    address: Address
    eap_id: string,
    eap: EconomicalActivityPark
}

interface Address {
    id: string,
    street_name: string,
    street_number: string,
    postal_code: string,
    municipality: string,
    district: string,
    province: string,
    region: string,
    geometry: Geometry
}

interface EconomicalActivityPark {
    id: string,
    name: string,
    document_url: string,
    area: string,
    allocation: string,
    geometry: Geometry,
    ie_id: string
    intercommunal_enterprise: IntercommunalEnterprise
}

interface IntercommunalEnterprise {
    id: string,
    name: string,
    geometry: Geometry
}

export type {
    legendArcGis,
    geoPortalService,
    enterpriseDetails,
    Enterprise,
    Address,
    EconomicalActivityPark,
    IntercommunalEnterprise
};
