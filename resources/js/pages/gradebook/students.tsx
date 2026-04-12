import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface ModuleEnrollment {
    id: number;
    title: string;
    subject: string | null;
    status: string;
    status_label: string;
    enrollment_id: number;
}

interface StudentData {
    id: number;
    name: string;
    email: string;
    enrollments_count: number;
    completed_count: number;
    in_progress_count: number;
    modules: ModuleEnrollment[];
}

interface Props {
    students: {
        data: StudentData[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Students', href: '/gradebook/students' },
];

const statusColors: Record<string, string> = {
    enrolled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    dropped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

export default function StudentsIndex({ students, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/gradebook/students', {
            search: search || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Students" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Students
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        View all students enrolled in your modules.
                    </p>
                </div>

                {/* Search */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Student</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="secondary">
                            <Search className="size-4" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Students Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Enrolled Modules</TableHead>
                                <TableHead>In Progress</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Modules</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="size-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No students found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.data.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{student.enrollments_count}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                                {student.in_progress_count}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-green-600 dark:text-green-400 font-semibold">
                                                {student.completed_count}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {student.modules.map((mod) => (
                                                    <Link key={mod.enrollment_id} href={`/gradebook/${mod.enrollment_id}`}>
                                                        <Badge
                                                            variant="outline"
                                                            className={`cursor-pointer ${statusColors[mod.status] ?? ''}`}
                                                        >
                                                            {mod.title}
                                                            <ChevronRight className="ml-1 size-3" />
                                                        </Badge>
                                                    </Link>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Simple pagination */}
                {students.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {students.data.length} of {students.total} students
                        </span>
                        <div className="flex gap-2">
                            {students.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/gradebook/students', {
                                        search: filters.search || undefined,
                                        page: students.current_page - 1,
                                    })}
                                >
                                    Previous
                                </Button>
                            )}
                            {students.current_page < students.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get('/gradebook/students', {
                                        search: filters.search || undefined,
                                        page: students.current_page + 1,
                                    })}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
