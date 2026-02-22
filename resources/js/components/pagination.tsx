import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (total === 0) return null;

    // Remove first (Previous) and last (Next) from numbered links
    const prevLink = links[0];
    const nextLink = links[links.length - 1];
    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{from}</span> to{' '}
                <span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </p>

            <div className="flex items-center gap-1">
                {prevLink.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={prevLink.url} preserveScroll preserveState>
                            <ChevronLeft className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                {pageLinks.map((link, i) => {
                    if (link.label === '...') {
                        return (
                            <span key={i} className="px-2 text-sm text-muted-foreground">
                                ...
                            </span>
                        );
                    }

                    return link.url ? (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link href={link.url} preserveScroll preserveState>
                                {link.label}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled
                        >
                            {link.label}
                        </Button>
                    );
                })}

                {nextLink.url ? (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={nextLink.url} preserveScroll preserveState>
                            <ChevronRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" disabled>
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
