import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, FileText, GraduationCap, Printer, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    module: Module;
    progress_records: ProgressRecord[];
}

interface Props {
    enrollment: Enrollment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Progress', href: '/progress' },
    { title: 'Module Details', href: '#' },
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

export default function ProgressShow({ enrollment }: Props) {
    const avgScore = enrollment.average_score;

    // Prepare chart data
    const barChartData = useMemo(() => {
        return enrollment.progress_records
            .filter((r) => r.score !== null)
            .reverse()
            .map((r) => ({
                name: r.title.length > 15 ? r.title.substring(0, 15) + '…' : r.title,
                score: r.max_score && r.max_score > 0
                    ? Math.round((r.score! / r.max_score) * 100)
                    : r.score,
                fullTitle: r.title,
            }));
    }, [enrollment.progress_records]);

    const pieChartData = useMemo(() => {
        const types = enrollment.progress_records.reduce(
            (acc, r) => {
                acc[r.type] = (acc[r.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
        return Object.entries(types).map(([type, count]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: count,
        }));
    }, [enrollment.progress_records]);

    const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${enrollment.module.title} - Progress`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back Link */}
                <div>
                    <Link href="/progress" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to My Progress
                    </Link>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {enrollment.module.title}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{enrollment.module.description}</p>
                        </div>
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
                                    View Certificate
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Module info + Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border md:col-span-2">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {enrollment.module.subject && (
                                <Badge variant="outline">{enrollment.module.subject.name}</Badge>
                            )}
                            <Badge variant="outline">{enrollment.module.level_label}</Badge>
                            <Badge variant="outline" className={statusColors[enrollment.status]}>
                                {enrollment.status_label}
                            </Badge>
                        </div>

                        {/* Progress bar */}
                        {avgScore !== null && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">Overall Progress</span>
                                    <span className="text-sm font-semibold">{avgScore}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className={`h-3 rounded-full transition-all ${avgScore >= 75
                                            ? 'bg-green-500'
                                            : avgScore >= 50
                                                ? 'bg-amber-500'
                                                : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.min(avgScore, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {enrollment.completed_at && (
                            <p className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Award className="size-4" />
                                Completed on {new Date(enrollment.completed_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            </p>
                        )}
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
                                        {avgScore !== null ? `${avgScore}%` : '—'}
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

                {/* Charts Section */}
                {enrollment.progress_records.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Score Bar Chart */}
                        {barChartData.length > 0 && (
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                                    Score Performance
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={barChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                            angle={-30}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, 'Score']}
                                            labelFormatter={(_, payload) =>
                                                payload?.[0]?.payload?.fullTitle || ''
                                            }
                                        />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {barChartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        (entry.score ?? 0) >= 75
                                                            ? '#10b981'
                                                            : (entry.score ?? 0) >= 50
                                                                ? '#f59e0b'
                                                                : '#ef4444'
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Activity Type Pie */}
                        {pieChartData.length > 0 && (
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                                    Activity Breakdown
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                            }
                                        >
                                            {pieChartData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Records */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment & Activity Records</h2>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Teacher</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrollment.progress_records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center">
                                        <p className="text-muted-foreground">No records yet. Your teacher will add progress records here.</p>
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
                                        <TableCell className="text-sm text-muted-foreground">
                                            {record.recorded_by.name}
                                        </TableCell>
                                        <TableCell className="max-w-50 truncate text-xs text-muted-foreground">
                                            {record.remarks || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Module Resources Link */}
                {enrollment.module.resources.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Module Resources ({enrollment.module.resources.length})
                        </h3>
                        <Link
                            href={`/library/${enrollment.module.slug}`}
                            className="text-sm text-primary hover:underline"
                        >
                            View all resources for this module →
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
