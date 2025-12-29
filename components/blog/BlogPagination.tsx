import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string;
    searchParams?: Record<string, string>;
}

export function BlogPagination({
    currentPage,
    totalPages,
    basePath = '/blog',
    searchParams = {},
}: BlogPaginationProps) {
    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        if (page > 1) {
            params.set('page', page.toString());
        } else {
            params.delete('page');
        }
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        if (totalPages <= 7) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (showEllipsisStart) {
                pages.push('ellipsis');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (showEllipsisEnd) {
                pages.push('ellipsis');
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav
            className="flex items-center justify-center gap-2"
            aria-label="Blog pagination"
        >
            {/* Previous Button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
            >
                {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Link>
                ) : (
                    <span>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </span>
                )}
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) =>
                    page === 'ellipsis' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-400"
                        >
                            …
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            className="min-w-[40px]"
                            asChild={currentPage !== page}
                        >
                            {currentPage === page ? (
                                <span>{page}</span>
                            ) : (
                                <Link href={createPageUrl(page)}>{page}</Link>
                            )}
                        </Button>
                    )
                )}
            </div>

            {/* Next Button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
            >
                {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                ) : (
                    <span>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                )}
            </Button>
        </nav>
    );
}
