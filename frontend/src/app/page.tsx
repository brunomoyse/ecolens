// home.tsx
"use client";

import MapComponent from "@/components/map-component";
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

import {geoPortalService} from "@/types"

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

export default function Home() {
    const { map } = useMap();
    const [isLayerVisible, setIsLayerVisible] = useState(true);

    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [subCategories, setSubCategories] = useState<geoPortalService[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string|null>(null);


    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null);
        getSubCategories(category).then(setSubCategories);
    }

    const handleSubCategoryChange = (subcategory: string) => {
        setSelectedSubCategory(subcategory);
        let arcGisUrl = geoPortalBaseUrl + selectedCategory + '/' + subcategory + '/' + 'MapServer'
        const newTileLayer = createTileLayerFromUrl(arcGisUrl);
        map?.addLayer(newTileLayer);
    }

    useEffect(() => {
        getCategories().then(setCategories)
    }, []);

    // Toggle function to show/hide layers
    const toggleLayerVisibility = (title: string) => {
        if (!map) return;
        setIsLayerVisible(!isLayerVisible);
        const layer = map.getLayers().getArray()
            .find(layer => layer.get('title') === 'pae-charleroi');
        if (layer) {
            layer.setVisible(!isLayerVisible);
        }
    };

    let listOfLayersTitle = ['pae-charleroi']

    return (
        <main className="flex min-h-screen max-h-screen">
            <aside className="w-1/4 bg-gray-200 p-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center my-4">Layers</h2>
                {/* GeoPortal categories */}
                <div className="my-2">
                    <Select onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Ajouter une couche" />
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
                        <SelectValue placeholder="Sélectionner une couche" />
                    </SelectTrigger>
                    <SelectContent>
                        {subCategories.map(subCategory => (
                            <SelectItem key={subCategory.name} value={formatSubCategoryName(subCategory.name)}>
                                {formatSubCategoryName(subCategory.name).replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>)}

                {listOfLayersTitle.map((title) => (
                    <div key={title} className="space-y-4 my-2">
                        <div onClick={() => toggleLayerVisibility(title)}
                             className="flex items-center p-2 hover:bg-gray-300 rounded-lg cursor-pointer">
                            <span className="ml-2">{title}</span>
                            <button className="ml-auto">
                                {/* Toggle Icon */}
                                {isLayerVisible ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                    </div>
                ))}
            </aside>

            <MapComponent/>
        </main>
    )
}
