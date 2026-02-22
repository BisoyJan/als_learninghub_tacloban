import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Megaphone, Pin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Announcements', href: '/announcements' },
    { title: 'View', href: '#' },
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
    is_pinned: boolean;
    published_at: string;
    author: Author;
    created_at: string;
}

interface Props {
    announcement: Announcement;
    [key: string]: unknown;
}

const audienceColors: Record<string, string> = {
    all: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    students: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    teachers: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    admins: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function AnnouncementShow({ announcement }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={announcement.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back Link */}
                <div>
                    <Link href="/announcements" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to Announcements
                    </Link>
                </div>

                {/* Announcement Content */}
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="mb-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                    <Megaphone className="size-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        {announcement.is_pinned && <Pin className="size-4 text-amber-500" />}
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {announcement.title}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {new Date(announcement.published_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span>by {announcement.author.name} ({announcement.author.role})</span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className={audienceColors[announcement.audience]}>
                                <Users className="mr-1 size-3" />
                                {announcement.audience === 'all' ? 'Everyone' : announcement.audience.charAt(0).toUpperCase() + announcement.audience.slice(1)}
                            </Badge>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                            {announcement.body}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
