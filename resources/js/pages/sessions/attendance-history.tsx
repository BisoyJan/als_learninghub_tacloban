import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Student {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface SessionInfo {
    id: number;
    title: string;
    scheduled_at: string;
    mode_label: string;
    module: { id: number; title: string; subject: { name: string } | null } | null;
    teacher: { name: string };
}

interface AttendanceRecord {
    id: number;
    status: string;
    status_label: string;
    remarks: string | null;
    marked_at: string | null;
    marked_by: { name: string } | null;
    session: SessionInfo;
}

interface PaginatedAttendances {
    data: AttendanceRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Summary {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
}

interface Props {
    student: Student;
    attendances: PaginatedAttendances;
    summary: Summary;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sessions', href: '/sessions' },
    { title: 'Attendance History', href: '#' },
];

const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
    excused: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
};

const statusIcons: Record<string, typeof CheckCircle> = {
    present: CheckCircle,
    absent: XCircle,
    late: Clock,
    excused: AlertCircle,
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export default function AttendanceHistory({ student, attendances, summary }: Props) {
    const attendanceRate = summary.total > 0
        ? Math.round(((summary.present + summary.late) / summary.total) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Attendance — ${student.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href="/sessions">
                        <button title="Back to sessions" className="mt-1 p-2 rounded-lg hover:bg-muted text-muted-foreground">
                            <ArrowLeft className="size-4" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Attendance History
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {student.name} · {student.email}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        { label: 'Total Sessions', value: summary.total, color: 'text-gray-900 dark:text-white', Icon: CalendarDays },
                        { label: 'Present', value: summary.present, color: 'text-green-600', Icon: CheckCircle },
                        { label: 'Absent', value: summary.absent, color: 'text-red-600', Icon: XCircle },
                        { label: 'Late', value: summary.late, color: 'text-amber-600', Icon: Clock },
                        { label: 'Excused', value: summary.excused, color: 'text-purple-600', Icon: AlertCircle },
                    ].map(({ label, value, color, Icon }) => (
                        <div key={label} className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`size-4 ${color}`} />
                                <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Attendance Rate */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                    <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium">Attendance Rate (Present + Late)</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{attendanceRate}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-green-500 transition-all w-[${attendanceRate}%]`}
                        />
                    </div>
                </div>

                {/* History List */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-sidebar-border/70 dark:border-sidebar-border">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Session History</h2>
                    </div>
                    {attendances.data.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <CalendarDays className="mx-auto mb-2 size-10 opacity-40" />
                            <p>No attendance records yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {attendances.data.map((record) => {
                                const Icon = statusIcons[record.status] ?? CheckCircle;
                                return (
                                    <div key={record.id} className="flex items-start gap-4 px-5 py-4">
                                        <Icon className={`size-5 mt-0.5 shrink-0 ${record.status === 'present' ? 'text-green-500' :
                                                record.status === 'absent' ? 'text-red-500' :
                                                    record.status === 'late' ? 'text-amber-500' : 'text-purple-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Link
                                                    href={`/sessions/${record.session.id}`}
                                                    className="font-medium text-gray-900 dark:text-white hover:text-primary"
                                                >
                                                    {record.session.title}
                                                </Link>
                                                <Badge variant="outline" className={`text-xs ${statusColors[record.status]}`}>
                                                    {record.status_label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {record.session.module?.title ?? 'Unknown Module'}
                                                {record.session.module?.subject ? ` · ${record.session.module.subject.name}` : ''}
                                                {' · '}
                                                {formatDate(record.session.scheduled_at)}
                                            </p>
                                            {record.remarks && (
                                                <p className="text-xs text-muted-foreground italic mt-1">
                                                    Remark: {record.remarks}
                                                </p>
                                            )}
                                            {record.marked_by && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Marked by {record.marked_by.name}
                                                    {record.marked_at ? ` · ${formatDate(record.marked_at)}` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {attendances.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-sidebar-border/70 dark:border-sidebar-border">
                            <Pagination
                                links={attendances.links}
                                from={(attendances.current_page - 1) * attendances.data.length + 1}
                                to={(attendances.current_page - 1) * attendances.data.length + attendances.data.length}
                                total={attendances.total}
                            />
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
