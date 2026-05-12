import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Image,
    Link2,
    Video,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Resource {
    id: number;
    title: string;
    description: string | null;
    type: string;
    file_path: string | null;
    external_url: string | null;
    file_size_formatted: string | null;
    url: string | null;
}

interface Module {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    level: string;
    status: string;
    created_at: string;
    subject: { id: number; name: string };
    creator: { name: string };
    resources: Resource[];
}

interface Enrollment {
    id: number;
    status: string;
    completed_at: string | null;
    time_spent_seconds: number;
    time_spent_formatted: string;
}

interface Props {
    module: Module;
    enrollment: Enrollment | null;
}

/** Sends a heartbeat to log time spent. Called every 60 s while the page is visible. */
function useTimeTracking(enrollmentId: number | undefined) {
    const accRef = useRef(0);
    const lastSentRef = useRef(Date.now());
    const INTERVAL_MS = 60_000; // 60 s

    useEffect(() => {
        if (!enrollmentId) return;

        const tick = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            const seconds = Math.round((Date.now() - lastSentRef.current) / 1000);
            lastSentRef.current = Date.now();
            accRef.current += seconds;

            // Fire-and-forget via fetch (no Inertia navigation)
            fetch('/sessions/log-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((r) => r.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? ''
                    ),
                },
                body: JSON.stringify({ enrollment_id: enrollmentId, seconds }),
            }).catch(() => {/* silent */ });
        }, INTERVAL_MS);

        return () => clearInterval(tick);
    }, [enrollmentId]);
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Library', href: '/library' },
    { title: 'Module', href: '#' },
];

const levelLabels: Record<string, string> = {
    elementary: 'Elementary',
    junior_high: 'Junior High School',
    senior_high: 'Senior High School',
};

const typeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    document: FileText,
    video: Video,
    link: Link2,
    image: Image,
};

const typeColors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-600 dark:bg-red-900/30',
    document: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    video: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
    link: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    image: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
};

export default function ShowModule({ module, enrollment }: Props) {
    useTimeTracking(enrollment?.id);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={module.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="mt-1">
                        <Link href="/library">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {module.title}
                        </h1>
                        {module.description && (
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {module.description}
                            </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline">{module.subject.name}</Badge>
                            <Badge variant="outline">{levelLabels[module.level]}</Badge>
                            {enrollment && (
                                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="size-3" />
                                    {enrollment.time_spent_formatted} spent
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground self-center">
                                by {module.creator.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resources ({module.resources.length})
                        </h2>
                    </div>

                    {module.resources.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <BookOpen className="mx-auto mb-2 size-10 opacity-40" />
                            <p>No resources available yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {module.resources.map((resource) => {
                                const Icon = typeIcons[resource.type] || FileText;
                                const colorClass = typeColors[resource.type] || 'bg-muted text-muted-foreground';

                                return (
                                    <div
                                        key={resource.id}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                                    >
                                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                                            <Icon className="size-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {resource.title}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {resource.type.toUpperCase()}
                                                </Badge>
                                                {resource.file_size_formatted && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {resource.file_size_formatted}
                                                    </span>
                                                )}
                                                {resource.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        — {resource.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {resource.url && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {resource.external_url ? (
                                                        <>
                                                            <ExternalLink className="size-4" />
                                                            Open
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="size-4" />
                                                            Download
                                                        </>
                                                    )}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
