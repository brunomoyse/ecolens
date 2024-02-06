import {useState, useEffect} from 'react';
import {useMap} from "@/context/map-context";
import {Eye, EyeOff, Layers, Minus, Plus} from 'lucide-react';
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
    const { map, layers, addLayer, toggleLayerVisibility } = useMap();

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [subCategories, setSubCategories] = useState<geoPortalService[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string|null>(null);

    const [layersList, setLayersList] = useState<BaseLayer[]>([])

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
        addLayer(newTileLayer);
        setSelectedSubCategory(subcategory);
    }

    const toggleWidgetVisibility = () => {
        setIsVisible(!isVisible);
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
                        <div key={baseLayer.get('title')} className="space-y-4 my-2">
                            <div onClick={() => toggleLayerVisibility(baseLayer)}
                                 className="flex items-center px-1 py-2 hover:bg-gray-300 rounded-lg cursor-pointer">
                                <span className="mr-6">{baseLayer.get('title')}</span>
                                <button className="ml-auto">
                                    {/* Toggle Icon */}
                                    {baseLayer.getVisible() ? <Eye/> : <EyeOff/>}
                                </button>
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
