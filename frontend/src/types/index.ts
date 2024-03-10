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

interface Coordinates {
    latitude: number,
    longitude: number
}

interface Plot {
    capakey: string
    __typename: string
}

interface Enterprise {
    id: string,
    establishmentNumber: string,
    enterpriseNumber: string,
    name: string,
    nameCommercial: string|null,
    nameShort: string|null,
    form: string|null,
    startDate: string|null,
    naceMain: string|null,
    naceOther: string[]|null,
    sector: string|null,
    addressExtra: string|null,
    addressId: string|null,
    address: Address|null,
    eapId: string|null,
    economicalActivityPark: EconomicalActivityPark|null,
    coordinates: Coordinates
    reliabilityIndex: number|null
    __typename: string
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
    __typename: string
}

interface IntercommunalEnterprise {
    id: string,
    name: string,
    geometry: Geometry
}

interface Pagination {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
}

interface NaceCode {
    code: string,
    description: string
}

export type {
    Plot,
    Pagination,
    legendArcGis,
    geoPortalService,
    Enterprise,
    Address,
    EconomicalActivityPark,
    IntercommunalEnterprise,
    NaceCode
};
