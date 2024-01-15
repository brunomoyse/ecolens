import {useState, useEffect} from 'react';
import {useMap} from "@/context/map-context";
import {DataTable} from "@/components/table/DataTable";

import { columns } from "@/components/table/Column";

interface LeftPanelProps {
    isVisible: boolean
}

export default function LeftPanel({ isVisible }: LeftPanelProps) {
    const { map, layers, addLayer, toggleLayerVisibility } = useMap();
    const data: any[] = [
        {
            id: '123',
            name: 'test name',
            type: 'test type'
        },
        {
            id: '456',
            name: 'test name 2',
            type: 'test type 2'
        },
    ]

    return (
        <aside
            className={`fixed z-20 h-auto w-full bg-gray-200 p-4 shadow-lg bottom-panel bottom-0 ${isVisible ? 'visible' : ''}`}>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data}/>
            </div>
        </aside>
    );
}
