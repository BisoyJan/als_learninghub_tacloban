import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, FileText, Search } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Subject {
    id: number;
    name: string;
    slug: string;
}

interface Module {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    level: string;
    status: string;
    subject: Subject;
    creator: { name: string };
    resources: { id: number }[];
}

interface EnrollmentStatus {
    status: string;
    completed_at: string | null;
}

interface PaginatedModules {
    data: Module[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
    last_page: number;
}

interface Props {
    modules: PaginatedModules;
    subjects: Subject[];
    filters: {
        search?: string;
        subject?: string;
        level?: string;
        type?: string;
    };
    enrollmentMap: Record<number, EnrollmentStatus>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Library', href: '/library' },
];

const levelLabels: Record<string, string> = {
    elementary: 'Elementary',
    junior_high: 'Junior High',
    senior_high: 'Senior High',
};

const levelColors: Record<string, string> = {
    elementary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    junior_high: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    senior_high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function LibraryIndex({ modules, subjects, filters, enrollmentMap }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject || '');
    const [levelFilter, setLevelFilter] = useState(filters.level || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    function applyFilters(overrides: Record<string, string | undefined> = {}) {
        const params: Record<string, string | undefined> = {
            search: search || undefined,
            subject: subjectFilter || undefined,
            level: levelFilter || undefined,
            type: typeFilter || undefined,
            ...overrides,
        };
        Object.keys(params).forEach((k) => {
            if (!params[k]) delete params[k];
        });
        router.get('/library', params, { preserveState: true, preserveScroll: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Learning Library" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Learning Library
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Browse and access learning modules and resources.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search modules..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Select
                            value={subjectFilter || 'all'}
                            onValueChange={(v) => {
                                const val = v === 'all' ? '' : v;
                                setSubjectFilter(val);
                                applyFilters({ subject: val || undefined });
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={levelFilter || 'all'}
                            onValueChange={(v) => {
                                const val = v === 'all' ? '' : v;
                                setLevelFilter(val);
                                applyFilters({ level: val || undefined });
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-36">
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="elementary">Elementary</SelectItem>
                                <SelectItem value="junior_high">Junior High</SelectItem>
                                <SelectItem value="senior_high">Senior High</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={typeFilter || 'all'}
                            onValueChange={(v) => {
                                const val = v === 'all' ? '' : v;
                                setTypeFilter(val);
                                applyFilters({ type: val || undefined });
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-36">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button type="submit" variant="secondary">
                            <Search className="size-4" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Module Grid */}
                {modules.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 py-16 text-center dark:border-sidebar-border">
                        <BookOpen className="mb-3 size-12 text-muted-foreground/40" />
                        <p className="text-lg font-medium text-muted-foreground">No modules found</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.data.map((mod) => {
                            const enrollment = enrollmentMap[mod.id];
                            const isCompleted = enrollment?.status === 'completed';
                            const isInProgress = enrollment?.status === 'in_progress';
                            const isEnrolled = enrollment?.status === 'enrolled';

                            return (
                                <Link
                                    key={mod.id}
                                    href={`/library/${mod.slug}`}
                                    className={`group flex flex-col rounded-xl border p-5 transition-all hover:shadow-md ${isCompleted
                                            ? 'border-green-300 bg-green-50/50 hover:border-green-400 dark:border-green-800 dark:bg-green-950/20 dark:hover:border-green-700'
                                            : isInProgress
                                                ? 'border-amber-200 hover:border-amber-300 dark:border-amber-800 dark:hover:border-amber-700'
                                                : 'border-sidebar-border/70 hover:border-primary/30 dark:border-sidebar-border dark:hover:border-primary/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${isCompleted
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                                                : 'bg-primary/10 text-primary'
                                            }`}>
                                            {isCompleted ? <CheckCircle2 className="size-5" /> : <BookOpen className="size-5" />}
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            {enrollment && (
                                                isCompleted ? (
                                                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                                        <CheckCircle2 className="size-3" />
                                                        Completed
                                                    </div>
                                                ) : isInProgress ? (
                                                    <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                        <Clock className="size-3" />
                                                        In Progress
                                                    </div>
                                                ) : isEnrolled ? (
                                                    <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                        <BookOpen className="size-3" />
                                                        Enrolled
                                                    </div>
                                                ) : null
                                            )}
                                            <Badge variant="outline" className={levelColors[mod.level] ?? ''}>
                                                {levelLabels[mod.level]}
                                            </Badge>
                                        </div>
                                    </div>

                                    <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-primary dark:text-white line-clamp-2">
                                        {mod.title}
                                    </h3>

                                    {mod.description && (
                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                            {mod.description}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {mod.subject.name}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <FileText className="size-3" />
                                            {mod.resources.length} resource{mod.resources.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {modules.last_page > 1 && (
                    <Pagination
                        links={modules.links}
                        from={modules.from}
                        to={modules.to}
                        total={modules.total}
                    />
                )}
            </div>
        </AppLayout>
    );
}
