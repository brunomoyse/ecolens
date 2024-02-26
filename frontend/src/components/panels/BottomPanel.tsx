import {useEffect, useRef, useState} from 'react';
import {DataTable} from "@/components/table/DataTable";
import DynamicPagination from "@/components/table/DynamicPagination";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

import {columns} from "@/components/table/Column";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {fetchEnterprises} from "@/store/slices/enterpriseSlice";
import {ImperativePanelHandle} from "react-resizable-panels";
import {PanelBottomOpen, PanelBottomClose} from "lucide-react";
import {useMap} from "@/context/map-context";
import {transformExtent} from "ol/proj";
import {debounce} from "next/dist/server/utils";

export default function BottomPanel() {
    const { map } = useMap();

    const dispatch = useAppDispatch();
    const enterprises = useAppSelector((state) => state.enterprise.enterprisesData);
    const currentPagination = useAppSelector((state) => state.enterprise.enterprisesPagination);
    const drawnFeature = useAppSelector((state) => state.drawing.drawnFeature);

    const panelRef = useRef<ImperativePanelHandle>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const togglePanel = () => {
        if (isPanelOpen) {
            panelRef.current?.collapse();
        } else {
            panelRef.current?.expand();
        }
        setIsPanelOpen(!isPanelOpen); // Toggle panel state
    };



    useEffect(() => {
        if (!map) return;

        const fetchData = (args: any) => {
            if (!map) return;

            if (drawnFeature) {
                args = { ...args, wkt: drawnFeature };
                dispatch(fetchEnterprises({ ...args, wkt: drawnFeature }));
            } else {
                const currentBbox3857 = map.getView().calculateExtent(map.getSize());
                const bboxWGS84 = transformExtent(currentBbox3857, 'EPSG:3857', 'EPSG:4326');
                args = { ...args, bbox: bboxWGS84 };
            }

            dispatch(fetchEnterprises({ ...args }))
        };

        const debouncedFetchData = debounce(fetchData, 800);

        // Listen for the postrender event
        map.on('postrender', debouncedFetchData);

        // Cleanup function to remove the event listener
        return () => {
            map.un('postrender', debouncedFetchData);
        };
    }, [map, dispatch, drawnFeature, currentPagination]);

    return (
        <ResizablePanelGroup
            direction="vertical"
            className={`fixed z-20 h-screen w-full shadow-lg bottom-0`}
            style={{pointerEvents: 'none'}}
        >
            <ResizablePanel
                className="bg-transparent"
                defaultSize={65}
                minSize={65}
                style={{pointerEvents: 'none'}}
            >
                <div className="flex h-full bg-transparent -z-10"/>
            </ResizablePanel>
            <div className="flex justify-between items-center bg-gray-200 w-full py-4 pr-6" style={{pointerEvents: 'auto'}}>
                <ResizableHandle withHandle className="py-3" />
                {panelRef.current?.isExpanded() && <PanelBottomClose onClick={togglePanel} className="h-6 w-6 text-black cursor-pointer"/> }
                {panelRef.current?.isCollapsed() &&  <PanelBottomOpen onClick={togglePanel} className="h-6 w-6 text-black cursor-pointer"/> }
            </div>

            <ResizablePanel
                ref={panelRef}
                collapsible={true}
                defaultSize={35}
                maxSize={35}
            >
                <aside className="bg-gray-200 h-screen w-full" style={{pointerEvents: 'auto'}}>
                    <div className="container mx-auto" style={{pointerEvents: 'auto'}}>
                        {enterprises && <DataTable columns={columns} data={enterprises}/>}
                    </div>
                    <DynamicPagination />
                </aside>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
