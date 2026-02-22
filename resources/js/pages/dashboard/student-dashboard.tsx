import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, GraduationCap, Megaphone, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface StudentStats {
    modulesAvailable: number;
    enrolled: number;
    completed: number;
    announcements: number;
}

export default function StudentDashboard() {
    const { auth, stats } = usePage<{ auth: { user: { name: string } }; stats: StudentStats }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-linear-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-sidebar-border">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {auth.user.name}!
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Continue your learning journey. Here's your progress overview.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={BookOpen}
                        label="Modules Available"
                        value={String(stats.modulesAvailable)}
                        description="Published modules"
                        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Enrolled"
                        value={String(stats.enrolled)}
                        description="Active enrollments"
                        color="text-green-600 bg-green-100 dark:bg-green-900/30"
                    />
                    <StatCard
                        icon={GraduationCap}
                        label="Completed"
                        value={String(stats.completed)}
                        description="Modules finished"
                        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    />
                    <StatCard
                        icon={Megaphone}
                        label="Announcements"
                        value={String(stats.announcements)}
                        description="Updates for you"
                        color="text-orange-600 bg-orange-100 dark:bg-orange-900/30"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/library"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Browse Modules</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Explore available learning modules and resources.
                        </p>
                    </Link>
                    <Link
                        href="/progress"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">My Progress</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            View your learning progress and assessment records.
                        </p>
                    </Link>
                    <Link
                        href="/announcements"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Announcements</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Stay updated with the latest news and updates.
                        </p>
                    </Link>
                    <Link
                        href="/forum"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white">Forum</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ask questions and connect with the community.
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
