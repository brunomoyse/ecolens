import {useEffect, useRef, useState} from 'react';
import {DataTable} from "@/components/table/DataTable";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"


import { columns } from "@/components/table/Column";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {fetchEnterprises} from "@/store/slices/enterpriseSlice";
import {ImperativePanelHandle} from "react-resizable-panels";
import {PanelBottomOpen, PanelBottomClose} from "lucide-react";

export default function BottomPanel() {
    const dispatch = useAppDispatch();
    const enterprises = useAppSelector((state) => state.enterprise.enterprises);

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
        dispatch(fetchEnterprises({ first: 5 }));
    }, [dispatch]);

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
                {panelRef.current?.isExpanded() && <PanelBottomClose onClick={togglePanel} className="h-6 w-6 text-black"/> }
                {panelRef.current?.isCollapsed() &&  <PanelBottomOpen onClick={togglePanel} className="h-6 w-6 text-black"/> }
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
                    <Pagination style={{pointerEvents: 'auto'}}>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#"/>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    1
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">
                                    2
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">
                                    3
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis/>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">
                                    10
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#"/>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </aside>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
