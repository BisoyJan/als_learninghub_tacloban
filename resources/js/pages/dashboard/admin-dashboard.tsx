import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarDays, ClipboardList, Mail, Settings, Shield, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface AdminStats {
    totalUsers: number;
    teachers: number;
    students: number;
    activeUsers: number;
    modules: number;
    publishedModules: number;
    enrollments: number;
    completedEnrollments: number;
}

interface RecentMessage {
    id: number;
    sender: string;
    sender_role: string;
    subject: string | null;
    preview: string;
    read: boolean;
    created_at: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    module: string | null;
    scheduled_at: string;
    mode_label: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
}

export default function AdminDashboard() {
    const { auth, stats, recentMessages, upcomingSessions } = usePage<{
        auth: { user: { name: string } };
        stats: AdminStats;
        recentMessages: RecentMessage[];
        upcomingSessions: UpcomingSession[];
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-linear-to-r from-violet-50 to-purple-50 p-6 dark:from-violet-950/20 dark:to-purple-950/20 dark:border-sidebar-border">
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
                        value={String(stats.totalUsers)}
                        description={`${stats.activeUsers} active`}
                        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <StatCard
                        icon={Users}
                        label="Teachers"
                        value={String(stats.teachers)}
                        description="Facilitators"
                        color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <StatCard
                        icon={Users}
                        label="Students"
                        value={String(stats.students)}
                        description="Learners"
                        color="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Modules"
                        value={String(stats.modules)}
                        description={`${stats.publishedModules} published`}
                        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    />
                    <StatCard
                        icon={ClipboardList}
                        label="Enrollments"
                        value={String(stats.enrollments)}
                        description={`${stats.completedEnrollments} completed`}
                        color="text-rose-600 bg-rose-100 dark:bg-rose-900/30"
                    />
                </div>

                {/* Recent Messages + Upcoming Sessions */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Messages Widget */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Mail className="size-4" /> Recent Messages from Learners
                            </h2>
                            <Link href="/messages" className="text-xs text-primary hover:underline">View all</Link>
                        </div>
                        {recentMessages.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
                        ) : (
                            <div className="divide-y divide-sidebar-border/40 dark:divide-sidebar-border/30">
                                {recentMessages.map((msg) => (
                                    <Link
                                        key={msg.id}
                                        href="/messages"
                                        className="flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className={`mt-0.5 size-2 rounded-full flex-shrink-0 ${msg.read ? 'bg-transparent' : 'bg-primary'}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between">
                                                <span className={`text-sm truncate ${msg.read ? 'text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white'}`}>
                                                    {msg.sender}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{msg.created_at}</span>
                                            </div>
                                            {msg.subject && <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>}
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.preview}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Sessions Widget */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarDays className="size-4" /> Upcoming Sessions
                            </h2>
                            <Link href="/sessions" className="text-xs text-primary hover:underline">View all</Link>
                        </div>
                        {upcomingSessions.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No upcoming sessions.</p>
                        ) : (
                            <div className="divide-y divide-sidebar-border/40 dark:divide-sidebar-border/30">
                                {upcomingSessions.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/sessions/${session.id}`}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <CalendarDays className="size-4 text-muted-foreground flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.title}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(session.scheduled_at)} · {session.mode_label}</p>
                                            {session.module && <p className="text-xs text-muted-foreground truncate">{session.module}</p>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/admin/users"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <Users className="size-4" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary">
                                User Management
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage user accounts, approve registrations, and assign roles.
                        </p>
                    </Link>
                    <Link
                        href="/admin/modules"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <BookOpen className="size-4" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary">
                                Module Management
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Create and organize learning modules and resources.
                        </p>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="group rounded-xl border border-sidebar-border/70 p-6 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                                <Settings className="size-4" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary">
                                System Settings
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure school year, terms, and platform settings.
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
