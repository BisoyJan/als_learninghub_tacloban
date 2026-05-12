import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    Clock,
    MapPin,
    Users,
    Video,
    Monitor,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Module { id: number; title: string; subject: { name: string } | null }
interface Teacher { id: number; name: string }

interface Session {
    id: number;
    title: string;
    description: string | null;
    scheduled_at: string;
    ends_at: string;
    duration_minutes: number;
    location: string | null;
    mode: string;
    mode_label: string;
    status: string;
    status_label: string;
    notes: string | null;
    module: Module | null;
    teacher: Teacher;
}

interface RosterStudent {
    id: number;
    name: string;
    email: string;
    enrollment_id: number;
}

interface AttendanceRecord {
    id: number;
    status: string;
    status_label: string;
    remarks: string | null;
    marked_at: string | null;
    marked_by: string | null;
}

interface Stats {
    total: number;
    marked: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
}

interface Props {
    session: Session;
    roster: RosterStudent[];
    attendanceMap: Record<number, AttendanceRecord>;
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sessions', href: '/sessions' },
    { title: 'Session Detail', href: '#' },
];

const attendanceColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
    excused: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
};

const modeIcons: Record<string, typeof Monitor> = {
    in_person: MapPin,
    online: Video,
    hybrid: Monitor,
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function SessionShow({ session, roster, attendanceMap, stats }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(auth.user.role);
    const ModeIcon = modeIcons[session.mode] ?? Monitor;

    const form = useForm({ student_id: '', status: 'present', remarks: '' });
    const [inlineStudent, setInlineStudent] = useState<number | null>(null);
    const inlineForm = useForm({ student_id: '', status: 'present', remarks: '' });

    function markInline(studentId: number, currentStatus?: string) {
        setInlineStudent(studentId);
        inlineForm.setData({
            student_id: String(studentId),
            status: currentStatus ?? 'present',
            remarks: attendanceMap[studentId]?.remarks ?? '',
        });
    }

    function submitInline(e: React.FormEvent) {
        e.preventDefault();
        inlineForm.post(`/sessions/${session.id}/attendance`, {
            onSuccess: () => setInlineStudent(null),
        });
    }

    function markBulkAbsent() {
        if (!confirm('Mark all unmarked students as absent?')) return;
        router.post(`/sessions/${session.id}/bulk-absent`);
    }

    const attendanceRate = stats.total > 0
        ? Math.round(((stats.present + stats.late) / stats.total) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={session.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="mt-1">
                        <Link href="/sessions"><ArrowLeft className="size-4" /></Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{session.title}</h1>
                        {session.module && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {session.module.title}{session.module.subject ? ` · ${session.module.subject.name}` : ''}
                            </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <CalendarDays className="size-3" />
                                {formatDateTime(session.scheduled_at)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {session.duration_minutes} min
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <ModeIcon className="size-3" />
                                {session.mode_label}
                            </Badge>
                            {session.location && (
                                <Badge variant="outline">{session.location}</Badge>
                            )}
                            <Badge
                                variant="outline"
                                className={
                                    session.status === 'completed'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : session.status === 'cancelled'
                                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                }
                            >
                                {session.status_label}
                            </Badge>
                        </div>
                        {session.description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{session.description}</p>
                        )}
                    </div>
                </div>

                {/* Attendance Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-gray-700 dark:text-gray-200' },
                        { label: 'Marked', value: stats.marked, color: 'text-gray-700 dark:text-gray-200' },
                        { label: 'Present', value: stats.present, color: 'text-green-600' },
                        { label: 'Absent', value: stats.absent, color: 'text-red-600' },
                        { label: 'Late', value: stats.late, color: 'text-amber-600' },
                        { label: 'Excused', value: stats.excused, color: 'text-purple-600' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4 text-center">
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Attendance Rate Bar */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Rate</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{attendanceRate}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{ width: `${attendanceRate}%` }}
                        />
                    </div>
                </div>

                {/* Roster Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/70 dark:border-sidebar-border">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="size-4" /> Student Roster ({roster.length})
                        </h2>
                        {isTeacherOrAdmin && stats.marked < stats.total && (
                            <Button variant="outline" size="sm" onClick={markBulkAbsent}>
                                Mark Unmarked as Absent
                            </Button>
                        )}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marked By</TableHead>
                                <TableHead>Remarks</TableHead>
                                {isTeacherOrAdmin && <TableHead className="w-28">Action</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roster.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                        No enrolled students found for this module.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roster.map((student) => {
                                    const record = attendanceMap[student.id];
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                {inlineStudent === student.id ? (
                                                    <form onSubmit={submitInline} className="flex items-center gap-2">
                                                        <input type="hidden" value={student.id} onChange={() => { }} />
                                                        <Select
                                                            value={inlineForm.data.status}
                                                            onValueChange={(v) => inlineForm.setData('status', v)}
                                                        >
                                                            <SelectTrigger className="h-7 w-28 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="present">Present</SelectItem>
                                                                <SelectItem value="absent">Absent</SelectItem>
                                                                <SelectItem value="late">Late</SelectItem>
                                                                <SelectItem value="excused">Excused</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button type="submit" size="sm" className="h-7 px-2 text-xs">Save</Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2"
                                                            onClick={() => setInlineStudent(null)}
                                                        >
                                                            <XCircle className="size-3.5" />
                                                        </Button>
                                                    </form>
                                                ) : record ? (
                                                    <Badge variant="outline" className={`text-xs ${attendanceColors[record.status]}`}>
                                                        {record.status_label}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Not marked</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {record?.marked_by ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                {record?.remarks ?? '—'}
                                            </TableCell>
                                            {isTeacherOrAdmin && (
                                                <TableCell>
                                                    {inlineStudent !== student.id && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            onClick={() => markInline(student.id, record?.status)}
                                                        >
                                                            {record ? 'Edit' : 'Mark'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Notes */}
                {session.notes && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session Notes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{session.notes}</p>
                    </div>
                )}

                {/* Per-student attendance history link */}
                {isTeacherOrAdmin && (
                    <div className="text-sm text-muted-foreground">
                        View a student's full attendance history via{' '}
                        <span className="text-primary font-medium">Sessions → Learner History</span> from the student roster or gradebook.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
