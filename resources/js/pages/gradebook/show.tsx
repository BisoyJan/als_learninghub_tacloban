import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, FileText, GraduationCap, Plus, Printer, Trash2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
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
}

interface Resource {
    id: number;
    title: string;
    type: string;
    url: string | null;
}

interface Module {
    id: number;
    title: string;
    slug: string;
    description: string;
    level_label: string;
    subject: Subject | null;
    resources: Resource[];
}

interface Student {
    id: number;
    name: string;
    email: string;
}

interface RecordedBy {
    id: number;
    name: string;
}

interface ProgressRecord {
    id: number;
    title: string;
    type: string;
    type_label: string;
    score: number | null;
    max_score: number | null;
    percentage: string | null;
    remarks: string | null;
    recorded_date: string;
    recorded_by: RecordedBy;
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

interface Props {
    enrollment: Enrollment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gradebook', href: '/gradebook' },
    { title: 'Student Progress', href: '#' },
];

const statusColors: Record<string, string> = {
    enrolled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    dropped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const typeColors: Record<string, string> = {
    assessment: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    activity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    milestone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};

export default function GradebookShow({ enrollment }: Props) {
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [recordForm, setRecordForm] = useState({
        title: '',
        type: 'activity' as 'assessment' | 'activity' | 'milestone',
        score: '',
        max_score: '',
        remarks: '',
        recorded_date: new Date().toISOString().split('T')[0],
    });
    const flash = usePage().props.flash as { success?: string; error?: string } | undefined;

    function handleAddRecord(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(`/gradebook/${enrollment.id}/records`, {
            ...recordForm,
            score: recordForm.score ? Number(recordForm.score) : null,
            max_score: recordForm.max_score ? Number(recordForm.max_score) : null,
        }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setShowAddRecord(false);
                setRecordForm({
                    title: '',
                    type: 'activity',
                    score: '',
                    max_score: '',
                    remarks: '',
                    recorded_date: new Date().toISOString().split('T')[0],
                });
            },
        });
    }

    function handleDeleteRecord(record: ProgressRecord) {
        if (confirm(`Delete "${record.title}"? This cannot be undone.`)) {
            router.delete(`/gradebook/${enrollment.id}/records/${record.id}`);
        }
    }

    function handleStatusChange(status: string) {
        const label = { enrolled: 'Enrolled', in_progress: 'In Progress', completed: 'Completed', dropped: 'Dropped' }[status] ?? status;
        if (confirm(`Change status to "${label}"?`)) {
            router.patch(`/gradebook/${enrollment.id}/status`, { status });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${enrollment.student.name} - ${enrollment.module.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back + Header */}
                <div>
                    <Link href="/gradebook" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to Gradebook
                    </Link>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {enrollment.student.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/reports/progress/${enrollment.id}`} target="_blank">
                                    <Printer className="size-4" />
                                    Print Report
                                </a>
                            </Button>
                            {enrollment.status === 'completed' && (
                                <Button size="sm" asChild className="bg-green-600 text-white hover:bg-green-700">
                                    <a href={`/reports/certificate/${enrollment.id}`} target="_blank">
                                        <GraduationCap className="size-4" />
                                        Certificate
                                    </a>
                                </Button>
                            )}
                            <Select
                                value={enrollment.status}
                                onValueChange={(value) => handleStatusChange(value)}
                            >
                                <SelectTrigger className="w-auto">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Module Info + Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border md:col-span-2">
                        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {enrollment.module.title}
                        </h2>
                        <p className="mb-3 text-sm text-muted-foreground">{enrollment.module.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {enrollment.module.subject && (
                                <Badge variant="outline">{enrollment.module.subject.name}</Badge>
                            )}
                            <Badge variant="outline">{enrollment.module.level_label}</Badge>
                            <Badge variant="outline" className={statusColors[enrollment.status]}>
                                {enrollment.status_label}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                    <TrendingUp className="size-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Average Score</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {enrollment.average_score !== null ? `${enrollment.average_score}%` : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30">
                                    <FileText className="size-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Records</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {enrollment.progress_records.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Record */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progress Records</h2>
                    <Button onClick={() => setShowAddRecord(!showAddRecord)} variant={showAddRecord ? 'secondary' : 'default'}>
                        {showAddRecord ? <X className="size-4" /> : <Plus className="size-4" />}
                        {showAddRecord ? 'Cancel' : 'Add Record'}
                    </Button>
                </div>

                {showAddRecord && (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <form onSubmit={handleAddRecord} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="record-title">
                                        Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="record-title"
                                        value={recordForm.title}
                                        onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                                        placeholder="e.g. Module 1 Quiz, Portfolio Review"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="record-type">
                                        Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={recordForm.type}
                                        onValueChange={(value) => setRecordForm({ ...recordForm, type: value as 'assessment' | 'activity' | 'milestone' })}
                                    >
                                        <SelectTrigger id="record-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activity">Activity</SelectItem>
                                            <SelectItem value="assessment">Assessment</SelectItem>
                                            <SelectItem value="milestone">Milestone</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="record-date">
                                        Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="record-date"
                                        type="date"
                                        value={recordForm.recorded_date}
                                        onChange={(e) => setRecordForm({ ...recordForm, recorded_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <Label htmlFor="record-score">
                                        Score
                                    </Label>
                                    <Input
                                        id="record-score"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={recordForm.score}
                                        onChange={(e) => setRecordForm({ ...recordForm, score: e.target.value })}
                                        placeholder="e.g. 85"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="record-max">
                                        Max Score
                                    </Label>
                                    <Input
                                        id="record-max"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={recordForm.max_score}
                                        onChange={(e) => setRecordForm({ ...recordForm, max_score: e.target.value })}
                                        placeholder="e.g. 100"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="record-remarks">
                                        Remarks
                                    </Label>
                                    <Input
                                        id="record-remarks"
                                        value={recordForm.remarks}
                                        onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
                                        placeholder="Optional notes..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Plus className="size-4" />
                                    {processing ? 'Saving...' : 'Add Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Records Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Recorded By</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollment.progress_records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clock className="size-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No progress records yet.</p>
                                            <p className="text-xs text-muted-foreground">
                                                Add a record to start tracking this student's progress.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                enrollment.progress_records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={typeColors[record.type] ?? ''}>
                                                {record.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {record.score !== null ? (
                                                <span className="font-semibold">
                                                    {record.score}{record.max_score ? `/${record.max_score}` : ''}
                                                    {record.percentage && (
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            ({record.percentage})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(record.recorded_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {record.recorded_by.name}
                                        </TableCell>
                                        <TableCell className="max-w-50 truncate text-xs text-muted-foreground">
                                            {record.remarks || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteRecord(record)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete record"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
