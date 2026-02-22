import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    created_at: string;
    subject: Subject;
    creator: { id: number; name: string };
    resources: { id: number }[];
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
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modules', href: '/admin/modules' },
];

const levelLabels: Record<string, string> = {
    elementary: 'Elementary',
    junior_high: 'Junior High',
    senior_high: 'Senior High',
};

const statusBadge: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

export default function ModulesIndex({ modules, subjects, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters.subject || '');
    const [levelFilter, setLevelFilter] = useState(filters.level || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    function applyFilters(overrides: Record<string, string> = {}) {
        const params: Record<string, string | undefined> = {
            search: search || undefined,
            subject: subjectFilter || undefined,
            level: levelFilter || undefined,
            status: statusFilter || undefined,
            ...overrides,
        };
        // Clean empty values
        Object.keys(params).forEach((k) => {
            if (!params[k]) delete params[k];
        });
        router.get('/admin/modules', params, { preserveState: true, preserveScroll: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters();
    }

    function handleDelete(mod: Module) {
        if (confirm(`Are you sure you want to delete "${mod.title}"? All resources will also be removed.`)) {
            router.delete(`/admin/modules/${mod.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Modules" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Learning Modules
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Create, organize, and manage learning modules and their resources.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/modules/create">
                            <Plus className="size-4" />
                            New Module
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">
                                Search
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search modules..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-40">
                            <Label htmlFor="subject-filter">
                                Subject
                            </Label>
                            <Select
                                value={subjectFilter || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setSubjectFilter(val);
                                    applyFilters({ subject: val || undefined } as Record<string, string>);
                                }}
                            >
                                <SelectTrigger id="subject-filter">
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-36">
                            <Label htmlFor="level-filter">
                                Level
                            </Label>
                            <Select
                                value={levelFilter || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setLevelFilter(val);
                                    applyFilters({ level: val || undefined } as Record<string, string>);
                                }}
                            >
                                <SelectTrigger id="level-filter">
                                    <SelectValue placeholder="All Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="elementary">Elementary</SelectItem>
                                    <SelectItem value="junior_high">Junior High</SelectItem>
                                    <SelectItem value="senior_high">Senior High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-36">
                            <Label htmlFor="status-filter">
                                Status
                            </Label>
                            <Select
                                value={statusFilter || 'all'}
                                onValueChange={(v) => {
                                    const val = v === 'all' ? '' : v;
                                    setStatusFilter(val);
                                    applyFilters({ status: val || undefined } as Record<string, string>);
                                }}
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" variant="secondary" className="sm:w-auto">
                            <Search className="size-4" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Resources</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <BookOpen className="mx-auto mb-2 size-8 opacity-40" />
                                        <p>No modules found.</p>
                                        <p className="text-xs mt-1">Create your first module to get started.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                modules.data.map((mod) => (
                                    <TableRow key={mod.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{mod.title}</p>
                                                {mod.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                        {mod.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{mod.subject.name}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {levelLabels[mod.level] ?? mod.level}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusBadge[mod.status] ?? ''}>
                                                {mod.status.charAt(0).toUpperCase() + mod.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {mod.resources.length}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(mod.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/modules/${mod.id}`} title="View">
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/modules/${mod.id}/edit`} title="Edit">
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete"
                                                    onClick={() => handleDelete(mod)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {modules.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <Pagination
                                links={modules.links}
                                from={modules.from}
                                to={modules.to}
                                total={modules.total}
                            />
                        </div>
                    )}
                </div>

                <div className="text-sm text-muted-foreground">
                    Total: {modules.total} module{modules.total !== 1 ? 's' : ''}
                </div>
            </div>
        </AppLayout>
    );
}
