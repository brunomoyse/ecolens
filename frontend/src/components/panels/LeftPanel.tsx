import {useState, useEffect} from 'react';
import {useMap} from "@/context/map-context";
import { Eye, EyeOff } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {createTileLayerFromUrl} from "@/lib/utils"

import {geoPortalService, legendArcGis} from "@/types"
import BaseLayer from "ol/layer/Base";

// to delete
const getLegendTest = async () => {
    const response = await fetch('https://geoservices.wallonie.be/arcgis/rest/services/AMENAGEMENT_TERRITOIRE/PRE/MapServer/legend?f=pjson');
    const legendData = await response.json();
    return legendData as legendArcGis;
};

const geoPortalBaseUrl: string = 'https://geoservices.wallonie.be/arcgis/rest/services/';
const getJsonResponse: string = '?f=json';

const formatSubCategoryName = (fullName: string) => {
    // Split the full name by '/'
    const parts = fullName.split('/');
    // Return the second part if it exists, otherwise return the full name
    return parts.length >= 2 ? parts[1] : fullName;
};

const getCategories = async (): Promise<string[]> => {
    const data = await fetch(geoPortalBaseUrl + getJsonResponse);
    const json = await data.json()
    return json.folders ? json.folders : [];
};

const getSubCategories = async (selectedCategory: string): Promise<geoPortalService[]> => {
    const data = await fetch(geoPortalBaseUrl + selectedCategory + getJsonResponse);
    const json = await data.json()
    return json.folders ? json.services : [];
}

const getLegendArcGis = async (category: string, subCategory: string) => {
    const url: string = geoPortalBaseUrl + category + '/' + subCategory + '/MapServer' + '/legend' + getJsonResponse;
    const res = await fetch(url);
    const data: legendArcGis = await res.json();
};

interface LeftPanelProps {
    isVisible: boolean
}

export default function LeftPanel({ isVisible }: LeftPanelProps) {
    const { map, layers, addLayer, toggleLayerVisibility } = useMap();

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [subCategories, setSubCategories] = useState<geoPortalService[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string|null>(null);

    const [selectedLegend, setSelectedLegend] = useState<legendArcGis|null>(null);
    const [layersList, setLayersList] = useState<BaseLayer[]>([])
    const [legendData, setLegendData] = useState<legendArcGis|null>(null);

    useEffect(() => {
        getCategories().then(setCategories)
    }, []);


    useEffect(() => {
        const fetchLegend = async () => {
            const data = await getLegendTest();
            setLegendData(data);
        };

        fetchLegend();
    }, []);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null);
        getSubCategories(category).then(setSubCategories);
    }

    const handleSubCategoryChange = (subcategory: string) => {
        let arcGisUrl = geoPortalBaseUrl + selectedCategory + '/' + subcategory + '/' + 'MapServer'
        const newTileLayer = createTileLayerFromUrl(arcGisUrl);
        newTileLayer.set('title', subcategory)
        addLayer(newTileLayer);
        setSelectedSubCategory(subcategory);
    }

    return (
        <aside className={`fixed z-20 h-full w-1/4 bg-gray-200 p-4 shadow-lg left-panel ${isVisible ? 'visible' : ''}`}>
            <h2 className="text-2xl font-bold text-center my-4">Couches</h2>
            {/* GeoPortal categories */}
            <div className="my-2">
                <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Ajouter une couche"/>
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* GeoPortal subcategories, visible only when a category is selected */}
            {selectedCategory && (<Select onValueChange={handleSubCategoryChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une couche"/>
                </SelectTrigger>
                <SelectContent>
                    {subCategories.map(subCategory => (
                        <SelectItem key={subCategory.name} value={formatSubCategoryName(subCategory.name)}>
                            {formatSubCategoryName(subCategory.name).replace(/_/g, ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>)}

            {layers && layers.length > 0 && layers.map((baseLayer) => (
                <div key={baseLayer.get('title')} className="space-y-4 my-2">
                    <div onClick={() => toggleLayerVisibility(baseLayer)}
                         className="flex items-center p-2 hover:bg-gray-300 rounded-lg cursor-pointer">
                        <span>{baseLayer.get('title')}</span>
                        <button className="ml-auto">
                            {/* Toggle Icon */}
                            {baseLayer.getVisible() ? <Eye/> : <EyeOff/>}
                        </button>
                    </div>
                </div>
            ))}
            {/*
            {legendData && legendData && legendData.layers[0].legend.map((legendItem) => (
                <div key={legendItem.url} className="flex items-center justify-between p-1">
                    <span
                        className="border-l-2 border-gray-400 pl-2">{legendItem.label}</span>
                    <img
                        draggable={false}
                        src={`data:image/png;base64, ${legendItem.imageData}`}
                        alt={legendItem.label ?? ''}/>
                </div>
            ))}
            */}
        </aside>
    );
}
