import {useState, useEffect} from 'react';
import {legendArcGis} from "@/types"
import Image from "next/image";
import {useDraggable} from "@/lib/utils";

const getLegendPae = async () => {
    const response = await fetch('https://geoservices.wallonie.be/arcgis/rest/services/AMENAGEMENT_TERRITOIRE/PRE/MapServer/legend?f=pjson');
    const legendData = await response.json();
    return legendData as legendArcGis;
};

// const geoPortalBaseUrl: string = 'https://geoservices.wallonie.be/arcgis/rest/services/';
// const getJsonResponse: string = '?f=json';
//
// const getLegendArcGis = async (category: string, subCategory: string) => {
//     const url: string = geoPortalBaseUrl + category + '/' + subCategory + '/MapServer' + '/legend' + getJsonResponse;
//     const res = await fetch(url);
//     const data: legendArcGis = await res.json();
// };

export default function LegendWidget() {
    useDraggable('legend-widget', 'legend-widget');

    const [legendData, setLegendData] = useState<legendArcGis|null>(null);

    useEffect(() => {
        const fetchLegend = async () => {
            const data = await getLegendPae();
            setLegendData(data);
        };

        fetchLegend();
    }, []);

    return (
        <aside id="legend-widget" className="absolute left-12 bottom-12 p-4 z-10 bg-gray-200 rounded-3xl shadow-lg select-none cursor-move">
            <div>
                {legendData && legendData && legendData.layers[0].legend.map((legendItem) => (
                    <div key={legendItem.url} className="flex justify-start p-1">
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
                            className="ml-2">{legendItem.label}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    );
}
