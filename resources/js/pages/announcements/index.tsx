import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, Megaphone, Pin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Announcements', href: '/announcements' },
];

interface Author {
    id: number;
    name: string;
    role: string;
}

interface Announcement {
    id: number;
    title: string;
    body: string;
    audience: string;
    audience_label?: string;
    is_pinned: boolean;
    published_at: string;
    author: Author;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    announcements: PaginatedData<Announcement>;
    [key: string]: unknown;
}

const audienceColors: Record<string, string> = {
    all: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    students: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    teachers: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    admins: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function AnnouncementsIndex({ announcements }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const canManage = auth.user.role === 'admin' || auth.user.role === 'teacher';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                            <Megaphone className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
                            <p className="text-sm text-muted-foreground">Stay updated with the latest news</p>
                        </div>
                    </div>
                    {canManage && (
                        <Link
                            href="/announcements-manage"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Manage Announcements
                        </Link>
                    )}
                </div>

                {/* Announcements List */}
                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 py-16 dark:border-sidebar-border">
                        <Megaphone className="mb-4 size-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-muted-foreground">No announcements yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground/70">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.data.map((announcement) => (
                            <Link
                                key={announcement.id}
                                href={`/announcements/${announcement.id}`}
                                className="group block rounded-xl border border-sidebar-border/70 p-5 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {announcement.is_pinned && (
                                                <Pin className="size-4 text-amber-500 shrink-0" />
                                            )}
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary truncate">
                                                {announcement.title}
                                            </h2>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {announcement.body.replace(/<[^>]*>/g, '')}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(announcement.published_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <span>by {announcement.author.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge variant="outline" className={audienceColors[announcement.audience]}>
                                            <Users className="mr-1 size-3" />
                                            {announcement.audience === 'all' ? 'Everyone' : announcement.audience.charAt(0).toUpperCase() + announcement.audience.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {announcements.prev_page_url && (
                            <Link href={announcements.prev_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Previous
                            </Link>
                        )}
                        <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                            Page {announcements.current_page} of {announcements.last_page}
                        </span>
                        {announcements.next_page_url && (
                            <Link href={announcements.next_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
