import { Head, usePage } from '@inertiajs/react';
import { BookOpen, MessageSquare, Shield, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function AdminDashboard() {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-r from-violet-50 to-purple-50 p-6 dark:from-violet-950/20 dark:to-purple-950/20 dark:border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30">
                            <Shield className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Admin Panel
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Welcome, {auth.user.name}. Manage the ALS Connect platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Users}
                        label="Total Users"
                        value="—"
                        description="Coming soon"
                        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={Users}
                        label="Teachers"
                        value="—"
                        description="Coming soon"
                        color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Modules"
                        value="—"
                        description="Coming soon"
                        color="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Announcements"
                        value="—"
                        description="Coming soon"
                        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    />
                </div>

                {/* Management Sections */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage user accounts, approve registrations, and assign roles.
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">System Reports</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            View system-wide reports and analytics for the learning center.
                        </p>
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Create and manage official announcements for all stakeholders.
                        </p>
                    </div>
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
