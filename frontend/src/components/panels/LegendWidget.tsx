import {useState, useEffect} from 'react';
import {useMap} from "@/context/map-context";
import {Eye, EyeOff, Minus, Plus} from 'lucide-react';
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
import {DragHandleDots2Icon} from "@radix-ui/react-icons";
import Image from "next/image";

const getLegendTest = async () => {
    const response = await fetch('https://geoservices.wallonie.be/arcgis/rest/services/AMENAGEMENT_TERRITOIRE/PRE/MapServer/legend?f=pjson');
    const legendData = await response.json();
    return legendData as legendArcGis;
};

const geoPortalBaseUrl: string = 'https://geoservices.wallonie.be/arcgis/rest/services/';
const getJsonResponse: string = '?f=json';

const getLegendArcGis = async (category: string, subCategory: string) => {
    const url: string = geoPortalBaseUrl + category + '/' + subCategory + '/MapServer' + '/legend' + getJsonResponse;
    const res = await fetch(url);
    const data: legendArcGis = await res.json();
};

export default function LegendWidget() {
    const { map, layers, addLayer, toggleLayerVisibility } = useMap();

    const [legendData, setLegendData] = useState<legendArcGis|null>(null);

    const [isWidgetVisible, setIsWidgetVisible] = useState(true);

    useEffect(() => {
        const fetchLegend = async () => {
            const data = await getLegendTest();
            setLegendData(data);
        };

        fetchLegend();
    }, []);

    const toggleWidgetVisibility = () => {
        setIsWidgetVisible(!isWidgetVisible);
    }

    return (
        <aside id="legend-widget" className="absolute left-12 bottom-12 p-4 z-10 bg-gray-200 rounded-3xl shadow-lg select-none cursor-move">
            <div>
                {isWidgetVisible && legendData && legendData && legendData.layers[0].legend.map((legendItem) => (
                    <div key={legendItem.url} className="flex items-center justify-between p-1">
                    <span
                        className="border-l-2 border-gray-400 pl-2">{legendItem.label}</span>
                        <Image
                            width={20}
                            height={20}
                            draggable={false}
                            src={`data:image/png;base64, ${legendItem.imageData}`}
                            alt={legendItem.label ?? ''}/>
                    </div>
                ))}
            </div>
        </aside>
    );
}
