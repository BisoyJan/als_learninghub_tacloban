import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, MessageSquare, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface TeacherStats {
    modules: number;
    myStudents: number;
    activeEnrollments: number;
    forumThreads: number;
}

export default function TeacherDashboard() {
    const { auth, stats } = usePage<{ auth: { user: { name: string } }; stats: TeacherStats }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-linear-to-r from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Good day, {auth.user.name}!
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Manage your classes, track student progress, and share resources.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="My Students"
                        value={String(stats.myStudents)}
                        description="Enrolled learners"
                        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Modules"
                        value={String(stats.modules)}
                        description="Learning modules"
                        color="text-green-600 bg-green-100 dark:bg-green-900/30"
                    />
                    <StatCard
                        icon={ClipboardList}
                        label="Active Enrollments"
                        value={String(stats.activeEnrollments)}
                        description="Across all modules"
                        color="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="My Threads"
                        value={String(stats.forumThreads)}
                        description="Forum discussions"
                        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/gradebook"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Student Progress</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track and manage student enrollments and progress records.
                        </p>
                    </Link>
                    <Link
                        href="/library"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Browse Library</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Explore and manage learning modules and resources.
                        </p>
                    </Link>
                    <Link
                        href="/announcements-manage"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Announcements</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Create and manage announcements for students.
                        </p>
                    </Link>
                    <Link
                        href="/forum"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Community Forum</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Engage with students and answer questions.
                        </p>
                    </Link>
                </div>
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
