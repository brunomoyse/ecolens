// DynamicPagination.tsx
import React from 'react';
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {Pagination as PaginationType} from "@/types";
import {updateCurrentPage} from "@/store/slices/enterpriseSlice";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const DynamicPagination: React.FC = () => {
    const dispatch = useAppDispatch();
    const currentPagination: PaginationType|null = useAppSelector((state) => state.enterprise.enterprisesPagination);

    const handlePageChange = (page: number | string) => {
        if (currentPagination && page !== '...' && page !== currentPagination.currentPage) {
            // Dispatch action to update the current page, which should trigger a re-fetch or update of the displayed data
            // Replace 'updateCurrentPage' with your actual action creator
            dispatch(updateCurrentPage(typeof page === 'number' ? page : parseInt(page)));
        }
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
