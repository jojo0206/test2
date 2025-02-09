import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface EventListPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const EventListPagination: React.FC<EventListPaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const createPaginationItems = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink onClick={() => onPageChange(i)}>
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        return items;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        tabIndex={currentPage <= 1 ? -1 : undefined}
                        className={
                            currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={() => onPageChange(currentPage - 1)}
                    />
                </PaginationItem>
                {createPaginationItems()}
                <PaginationItem>
                    <PaginationNext 
                        tabIndex={currentPage >= totalPages ? -1 : undefined}
                        className={
                            currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={() => onPageChange(currentPage + 1)}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
