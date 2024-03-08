import {useState, useEffect} from 'react';
import {useMap} from "@/context/map-context";
import { Eye, EyeOff, Layers, Minus, Plus, X } from 'lucide-react';


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {createTileLayerFromUrl, useDraggable} from "@/lib/utils"

import {geoPortalService, legendArcGis} from "@/types"
import Image from "next/image";
import BaseLayer from "ol/layer/Base";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {fetchGeoPortalLegend} from "@/store/slices/legendSlice";

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

export default function LayerWidget() {
    const { map, layers, addLayer, removeLayer, toggleLayerVisibility } = useMap();
    useDraggable('layer-widget', 'drag-layer-widget');
    const dispatch = useAppDispatch();

    const geoPortalLegends = useAppSelector((state) => state.legend.geoPortalLegends);

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [subCategories, setSubCategories] = useState<geoPortalService[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string|null>(null);

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        getCategories().then(setCategories)
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
        newTileLayer.set('temporary', true)
        // Check if layer already exists
        const existingLayer = layers.find(layer => layer.get('title') === subcategory);
        if (!existingLayer) {
            // If layer does not exist, add it
            addLayer(newTileLayer);
        }
        setSelectedSubCategory(subcategory);
        dispatch(
            fetchGeoPortalLegend({
                layerName: subcategory,
                category: selectedCategory,
                subCategory: subcategory
            })
        );
    }

    const toggleWidgetVisibility = () => {
        setIsVisible(!isVisible);
    }

    const findLegend = (layer: BaseLayer) => {
        return geoPortalLegends.find(legend => legend.layerName === layer.get('title'))?.legendData;
    }

    return (
        <aside id="layer-widget" className="absolute z-20 left-12 top-12 bg-gray-200 rounded-3xl shadow-lg">
            <header id="drag-layer-widget" className="flex cursor-move justify-between py-4 px-4 bg-gray-300 rounded-t-3xl">
                <div className="flex">
                    <Layers className="h-6 w-6 mr-3" />
                    <h2 className="text-xl font-bold text-center pl-1 mr-4 select-none">Couches</h2>
                </div>
                {isVisible && ( <Minus onClick={toggleWidgetVisibility} className="w-6 h-6"/> )}
                {! isVisible && ( <Plus onClick={toggleWidgetVisibility} className="w-6 h-6"/> )}
            </header>

            {isVisible && (
            <div className="px-4 py-2">
                {/* List of layers available to display */}
                <section>
                    {layers && layers.length > 0 && layers.map((baseLayer) => (
                        <div key={baseLayer.get('title')}>
                            {/* Layer name and actions buttons */}
                            <div className="flex items-center px-1 pt-2 rounded-lg">
                                {/* Layer name */}
                                <span className="mr-6">{baseLayer.get('title')}</span>

                                {/* Buttons */}
                                <div className="ml-auto">

                                    { baseLayer.get('temporary') && (
                                        <button className="px-2 mx-2" onClick={() => removeLayer(baseLayer)}>
                                            <X/>
                                        </button>
                                    )}

                                    <button onClick={() => toggleLayerVisibility(baseLayer)}>
                                    {/* Toggle Icon */}
                                        {baseLayer.getVisible() ? <Eye/> : <EyeOff/>}
                                    </button>

                                </div>

                            </div>

                            {/* Legend */}
                            <div className="mb-2">
                                {/* Arcgis legends */}
                                {baseLayer.getVisible() && findLegend(baseLayer)?.layers[0].legend.map((legendItem) => (
                                    <div key={legendItem.url} className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                        <div className="flex flex-col justify-center">
                                            <Image
                                                width={20}
                                                height={20}
                                                draggable={false}
                                                src={`data:image/png;base64, ${legendItem.imageData}`}
                                                alt={legendItem.label ?? ''}
                                            />
                                        </div>
                                        <span
                                            className="ml-2 text-sm">{legendItem.label}
                                        </span>
                                    </div>
                                ))}
                                {/* Enterprise legends */}
                                {baseLayer.get('title') === 'Entreprises' && baseLayer.getVisible() && (
                                    <>
                                        {/* Primary sector */}
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div className="w-5 h-5 flex justify-center items-center">
                                                    {/* Green point */}
                                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                                </div>
                                            </div>
                                            <span className="ml-2 text-sm">
                                                Secteur primaire
                                            </span>
                                        </div>
                                        {/* Secondary sector */}
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div className="w-5 h-5 flex justify-center items-center">
                                                    {/* Red point */}
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                                </div>
                                            </div>
                                            <span className="ml-2 text-sm">
                                                Secteur secondaire
                                            </span>
                                        </div>
                                        {/* Tertiary sector */}
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div className="w-5 h-5 flex justify-center items-center">
                                                    {/* Blue point */}
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                                </div>
                                            </div>
                                            <span className="ml-2 text-sm">
                                                Secteur tertiaire
                                            </span>
                                        </div>
                                        {/* Unknown sector */}
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div className="w-5 h-5 flex justify-center items-center">
                                                    {/* Gray point */}
                                                    <div className="w-2.5 h-2.5 bg-gray-600 rounded-full"></div>
                                                </div>
                                            </div>
                                            <span className="ml-2 text-sm">
                                                Secteur inconnu
                                            </span>
                                        </div>

                                    </>
                                )}
                                {/* Parcelles cadastrales */}
                                {baseLayer.get('title') === 'Cadastre' && baseLayer.getVisible() && (
                                    <>
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div
                                                    className="w-5 h-5 bg-transparent ring-2 ring-black ring-inset flex items-center justify-center"/>

                                            </div>
                                            <span className="ml-2 text-sm">
                                                Parcelles cadastrales
                                            </span>
                                        </div>
                                    </>
                                )}
                                {/* Délimitation intercommunales */}
                                {baseLayer.get('title') === 'Délimitation intercommunales' && baseLayer.getVisible() && (
                                    <>
                                        <div className="flex items-center ml-2 pl-2 border-l-2 border-l-black ">
                                            <div className="flex flex-col justify-center">
                                                <div className="w-5 h-5 bg-transparent ring-4 ring-black ring-inset flex items-center justify-center" />
                                            </div>
                                            <span className="ml-2 text-sm">
                                                Limites intercommunales
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </section>


                {/* Add a layer*/}
                <section className="mb-4">
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
                    {selectedCategory && (
                        <Select onValueChange={handleSubCategoryChange}>
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
                        </Select>
                    )}
                </section>
            </div>
            )}
        </aside>
    );
}
