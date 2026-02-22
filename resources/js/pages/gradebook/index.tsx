import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronRight, Plus, Search, UserPlus, X } from 'lucide-react';
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

interface Module {
    id: number;
    title: string;
    level_label: string;
    subject: { id: number; name: string } | null;
}

interface Student {
    id: number;
    name: string;
    email: string;
}

interface ProgressRecord {
    id: number;
    title: string;
    type: string;
    score: number | null;
    max_score: number | null;
    percentage: string | null;
    recorded_date: string;
}

interface Enrollment {
    id: number;
    status: string;
    status_label: string;
    average_score: number | null;
    completed_at: string | null;
    created_at: string;
    student: Student;
    module: Module;
    progress_records: ProgressRecord[];
}

interface PaginatedEnrollments {
    data: Enrollment[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    enrollments: PaginatedEnrollments;
    modules: Module[];
    students: Student[];
    filters: {
        search?: string;
        module?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gradebook', href: '/gradebook' },
];

const statusColors: Record<string, string> = {
    enrolled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    dropped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

export default function GradebookIndex({ enrollments, modules, students, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showEnroll, setShowEnroll] = useState(false);
    const [enrollForm, setEnrollForm] = useState({ student_id: '', module_id: '' });
    const [enrolling, setEnrolling] = useState(false);
    const flash = usePage().props.flash as { success?: string; error?: string } | undefined;

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/gradebook', {
            search: search || undefined,
            module: moduleFilter || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleFilterChange(module: string, status: string) {
        setModuleFilter(module);
        setStatusFilter(status);
        router.get('/gradebook', {
            search: search || undefined,
            module: module || undefined,
            status: status || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleEnroll(e: React.FormEvent) {
        e.preventDefault();
        setEnrolling(true);
        router.post('/gradebook/enroll', enrollForm, {
            onFinish: () => {
                setEnrolling(false);
                setEnrollForm({ student_id: '', module_id: '' });
            },
            onSuccess: () => setShowEnroll(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gradebook" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Gradebook
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage student enrollments, track progress, and record assessments.
                        </p>
                    </div>
                    <Button onClick={() => setShowEnroll(!showEnroll)}>
                        <UserPlus className="size-4" />
                        Enroll Student
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {flash.error}
                    </div>
                )}

                {/* Enrollment Form */}
                {showEnroll && (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Enroll Student in Module
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowEnroll(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleEnroll} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <Label htmlFor="enroll-student">
                                    Student
                                </Label>
                                <Select
                                    value={enrollForm.student_id}
                                    onValueChange={(v) => setEnrollForm({ ...enrollForm, student_id: v })}
                                >
                                    <SelectTrigger id="enroll-student">
                                        <SelectValue placeholder="Select student..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name} ({s.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="enroll-module">
                                    Module
                                </Label>
                                <Select
                                    value={enrollForm.module_id}
                                    onValueChange={(v) => setEnrollForm({ ...enrollForm, module_id: v })}
                                >
                                    <SelectTrigger id="enroll-module">
                                        <SelectValue placeholder="Select module..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.title} ({m.subject?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={enrolling}>
                                <Plus className="size-4" />
                                {enrolling ? 'Enrolling...' : 'Enroll'}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Filters */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">
                                Search Student
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by student name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <Label htmlFor="module-filter">
                                Module
                            </Label>
                            <Select
                                value={moduleFilter || 'all'}
                                onValueChange={(v) => handleFilterChange(v === 'all' ? '' : v, statusFilter)}
                            >
                                <SelectTrigger id="module-filter">
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    {modules.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-40">
                            <Label htmlFor="status-filter">
                                Status
                            </Label>
                            <Select
                                value={statusFilter || 'all'}
                                onValueChange={(v) => handleFilterChange(moduleFilter, v === 'all' ? '' : v)}
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary">
                            <Search className="size-4" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Enrollments Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Avg Score</TableHead>
                                <TableHead>Records</TableHead>
                                <TableHead>Enrolled</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookOpen className="size-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No enrollments found.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Enroll a student to start tracking their progress.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                enrollments.data.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{enrollment.student.name}</p>
                                                <p className="text-xs text-muted-foreground">{enrollment.student.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{enrollment.module.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {enrollment.module.subject?.name} • {enrollment.module.level_label}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors[enrollment.status] ?? ''}>
                                                {enrollment.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {enrollment.average_score !== null
                                                ? <span className="font-semibold">{enrollment.average_score}%</span>
                                                : <span className="text-muted-foreground">—</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground">
                                                {enrollment.progress_records.length}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(enrollment.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/gradebook/${enrollment.id}`}>
                                                    View
                                                    <ChevronRight className="size-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {enrollments.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <Pagination
                                links={enrollments.links}
                                from={enrollments.from}
                                to={enrollments.to}
                                total={enrollments.total}
                            />
                        </div>
                    )}
                </div>

                <div className="text-sm text-muted-foreground">
                    Total: {enrollments.total} enrollment{enrollments.total !== 1 ? 's' : ''}
                </div>
            </div>
        </AppLayout>
    );
}
