import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, ChevronRight, Clock, GraduationCap, Medal, Sparkles, Star, Trophy, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Subject {
    id: number;
    name: string;
}

interface Module {
    id: number;
    title: string;
    slug: string;
    level_label: string;
    subject: Subject | null;
}

interface ProgressRecord {
    id: number;
    score: number | null;
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

interface UserBadge {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    earned_at: string;
}

interface Stats {
    totalEnrolled: number;
    completed: number;
    inProgress: number;
    averageScore: number | null;
}

interface Props {
    enrollments: Enrollment[];
    stats: Stats;
    badges: UserBadge[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Progress', href: '/progress' },
];

const statusColors: Record<string, string> = {
    enrolled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    dropped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    award: Award,
    star: Star,
    trophy: Trophy,
    medal: Medal,
    'graduation-cap': GraduationCap,
    sparkles: Sparkles,
};

const badgeColors: Record<string, string> = {
    green: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    amber: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    blue: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    purple: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
};

export default function ProgressIndex({ enrollments, stats, badges }: Props) {
    const STATUS_COLORS: Record<string, string> = {
        enrolled: '#3b82f6',
        in_progress: '#f59e0b',
        completed: '#10b981',
        dropped: '#6b7280',
    };

    const statusChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        enrollments.forEach((e) => {
            counts[e.status] = (counts[e.status] || 0) + 1;
        });
        return Object.entries(counts).map(([status, count]) => ({
            name: status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: STATUS_COLORS[status] || '#6b7280',
        }));
    }, [enrollments]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Progress" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track your learning journey across enrolled modules.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={BookOpen}
                        label="Enrolled Modules"
                        value={String(stats.totalEnrolled)}
                        description="Active enrollments"
                        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={Clock}
                        label="In Progress"
                        value={String(stats.inProgress)}
                        description="Currently working"
                        color="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatCard
                        icon={Award}
                        label="Completed"
                        value={String(stats.completed)}
                        description="Modules finished"
                        color="text-green-600 bg-green-100 dark:bg-green-900/30"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Average Score"
                        value={stats.averageScore !== null ? `${stats.averageScore}%` : '—'}
                        description="Across all records"
                        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    />
                </div>

                {/* Badges Section */}
                {badges.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="size-5 text-amber-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                My Badges ({badges.length})
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {badges.map((badge, index) => {
                                const IconComponent = badgeIcons[badge.icon] || Award;
                                const colorClass = badgeColors[badge.color] || badgeColors.amber;
                                return (
                                    <div
                                        key={`${badge.id}-${index}`}
                                        className={`group relative flex items-center gap-2 rounded-lg border px-3 py-2 transition-all hover:shadow-sm ${colorClass}`}
                                        title={`${badge.name}: ${badge.description}`}
                                    >
                                        <IconComponent className="size-5" />
                                        <div>
                                            <p className="text-sm font-medium leading-tight">{badge.name}</p>
                                            <p className="text-xs opacity-70">
                                                {new Date(badge.earned_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Progress Overview Chart */}
                {enrollments.length > 0 && statusChartData.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Enrollment Overview
                        </h2>
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                            {/* Pie Chart - no labels on slices to avoid clipping */}
                            <div className="w-48 h-48 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={75}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Custom Legend */}
                            <div className="flex flex-col gap-3">
                                {statusChartData.map((entry) => {
                                    const total = statusChartData.reduce((sum, d) => sum + d.value, 0);
                                    const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                    return (
                                        <div key={entry.name} className="flex items-center gap-3">
                                            <span
                                                className="inline-block size-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {entry.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {entry.value} ({pct}%)
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrollment Cards */}
                {enrollments.length === 0 ? (
                    <div className="rounded-xl border border-sidebar-border/70 p-12 text-center dark:border-sidebar-border">
                        <BookOpen className="mx-auto size-10 text-muted-foreground mb-3" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Active Enrollments</p>
                        <p className="text-sm text-muted-foreground">
                            Your teacher will enroll you in learning modules. Check back later!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment) => (
                            <Link
                                key={enrollment.id}
                                href={`/progress/${enrollment.id}`}
                                className="group rounded-xl border border-sidebar-border/70 p-5 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <Badge variant="outline" className={statusColors[enrollment.status]}>
                                        {enrollment.status_label}
                                    </Badge>
                                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary">
                                    {enrollment.module.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {enrollment.module.subject && (
                                        <span className="text-xs text-muted-foreground">
                                            {enrollment.module.subject.name}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                        {enrollment.module.level_label}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {enrollment.progress_records.length} record{enrollment.progress_records.length !== 1 ? 's' : ''}
                                    </span>
                                    {enrollment.average_score !== null && (
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {enrollment.average_score}%
                                        </span>
                                    )}
                                </div>

                                {/* Simple progress bar */}
                                {enrollment.average_score !== null && (
                                    <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{ width: `${Math.min(enrollment.average_score, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </Link>
                        ))}
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
