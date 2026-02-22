import { Head } from '@inertiajs/react';
import { BarChart3, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
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

interface CenterStats {
    totalStudents: number;
    activeStudents: number;
    totalTeachers: number;
    totalModules: number;
    totalEnrollments: number;
    completedEnrollments: number;
    activeEnrollments: number;
    completionRate: number;
}

interface ModuleStat {
    id: number;
    title: string;
    subject: string;
    level: string;
    enrolled: number;
    completed: number;
    inProgress: number;
    completionRate: number;
}

interface SubjectStat {
    id: number;
    name: string;
    modules: number;
    enrolled: number;
    completed: number;
    completionRate: number;
}

interface TopStudent {
    id: number;
    name: string;
    email: string;
    completed: number;
    total: number;
}

interface Props {
    centerStats: CenterStats;
    moduleStats: ModuleStat[];
    subjectStats: SubjectStat[];
    topStudents: TopStudent[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports & Analytics', href: '/admin/reports' },
];

export default function AdminReports({ centerStats, moduleStats, subjectStats, topStudents }: Props) {
    const subjectChartData = useMemo(
        () =>
            subjectStats.filter((s) => s.enrolled > 0).map((s) => ({
                name: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
                Enrolled: s.enrolled,
                Completed: s.completed,
            })),
        [subjectStats],
    );

    const completionPieData = useMemo(() => {
        const completed = centerStats.completedEnrollments;
        const active = centerStats.activeEnrollments - completed;
        const other = centerStats.totalEnrollments - centerStats.activeEnrollments;
        return [
            { name: 'Completed', value: completed, color: '#10b981' },
            { name: 'In Progress', value: active > 0 ? active : 0, color: '#f59e0b' },
            ...(other > 0 ? [{ name: 'Dropped', value: other, color: '#6b7280' }] : []),
        ].filter((d) => d.value > 0);
    }, [centerStats]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Reports & Analytics
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Center-wide analytics and performance reports.
                    </p>
                </div>

                {/* Center-wide Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Users} label="Total Students" value={String(centerStats.totalStudents)} description={`${centerStats.activeStudents} active`} color="text-blue-600 bg-blue-100 dark:bg-blue-900/30" />
                    <StatCard icon={GraduationCap} label="Total Teachers" value={String(centerStats.totalTeachers)} description="Managing learners" color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" />
                    <StatCard icon={BookOpen} label="Published Modules" value={String(centerStats.totalModules)} description={`${centerStats.totalEnrollments} total enrollments`} color="text-purple-600 bg-purple-100 dark:bg-purple-900/30" />
                    <StatCard icon={TrendingUp} label="Completion Rate" value={`${centerStats.completionRate}%`} description={`${centerStats.completedEnrollments} completed`} color="text-amber-600 bg-amber-100 dark:bg-amber-900/30" />
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Subject Performance */}
                    {subjectChartData.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="size-5 text-blue-500" />
                                By Subject
                            </h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={subjectChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Completion Overview Pie */}
                    {completionPieData.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="size-5 text-green-500" />
                                Enrollment Status
                            </h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={completionPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                    >
                                        {completionPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Module Breakdown Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Module Performance
                        </h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead className="text-center">Enrolled</TableHead>
                                <TableHead className="text-center">In Progress</TableHead>
                                <TableHead className="text-center">Completed</TableHead>
                                <TableHead className="text-center">Completion Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {moduleStats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No modules to display.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                moduleStats.map((mod) => (
                                    <TableRow key={mod.id}>
                                        <TableCell className="font-medium">{mod.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{mod.subject}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{mod.level}</TableCell>
                                        <TableCell className="text-center">{mod.enrolled}</TableCell>
                                        <TableCell className="text-center">{mod.inProgress}</TableCell>
                                        <TableCell className="text-center">{mod.completed}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-semibold ${mod.completionRate >= 70 ? 'text-green-600 dark:text-green-400' : mod.completionRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {mod.completionRate}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Top Students */}
                {topStudents.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Top Performing Students
                            </h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-center">Completed</TableHead>
                                    <TableHead className="text-center">Total Enrolled</TableHead>
                                    <TableHead className="text-center">Completion Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topStudents.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-bold text-lg">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </TableCell>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                                        <TableCell className="text-center font-semibold">{student.completed}</TableCell>
                                        <TableCell className="text-center">{student.total}</TableCell>
                                        <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                                            {student.total > 0 ? Math.round((student.completed / student.total) * 100) : 0}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, description, color }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    description: string;
    color: string;
}) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
            <div className="flex items-center gap-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    );
}
