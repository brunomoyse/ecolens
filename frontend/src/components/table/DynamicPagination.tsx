// DynamicPagination.tsx
import React, {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {Pagination as PaginationType} from "@/types";
import {fetchEnterprises} from "@/store/slices/enterpriseSlice";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {transformExtent} from "ol/proj";
import {useMap} from "@/context/map-context";

const DynamicPagination: React.FC = () => {
    const { map } = useMap();

    const dispatch = useAppDispatch();
    const currentPagination: PaginationType|null = useAppSelector((state) => state.enterprise.enterprisesPagination);
    const drawnFeature = useAppSelector((state) => state.drawing.drawnFeature);

    const handlePageChange = (page: number | string) => {
        if (!map || !currentPagination) return;
        if (typeof page === 'string') return; // ... (ellipsis)
        if (page === currentPagination.currentPage || currentPagination.firstPage > page || currentPagination.lastPage < page) return;
            let args: any = { page }
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

    const generatePageNumbers = (): Array<number | string> => {
        if (!currentPagination) {
            return [];
        }
        let pages: Array<number | string> = [1];
        const { currentPage, lastPage } = currentPagination;
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(lastPage - 1, currentPage + 2);

        if (currentPage <= 3) {
            endPage = Math.min(5, lastPage - 1);
        }

        if (currentPage >= lastPage - 2) {
            startPage = Math.max(lastPage - 4, 2);
        }

        if (startPage > 2) {
            pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < lastPage - 1) {
            pages.push('...');
        }

        if (lastPage > 1) {
            pages.push(lastPage);
        }

        return pages;
    };

    if (!currentPagination) {
        return null;
    }

    return (
        <Pagination style={{ pointerEvents: 'auto' }}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => handlePageChange(currentPagination.currentPage - 1)} />
                </PaginationItem>
                {generatePageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink href="#" onClick={() => handlePageChange(page)} isActive={currentPagination.currentPage === page}>
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext href="#" onClick={() => handlePageChange(currentPagination.currentPage + 1)} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default DynamicPagination;
