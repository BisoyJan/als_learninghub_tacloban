import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Clock, Megaphone, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Notifications', href: '/notifications' },
];

interface NotificationData {
    type: string;
    title?: string;
    message?: string;
    announcement_id?: number;
    thread_id?: number;
    thread_slug?: string;
    thread_title?: string;
    reply_by?: string;
    author?: string;
}

interface AppNotification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    notifications: PaginatedData<AppNotification>;
    unreadCount: number;
    [key: string]: unknown;
}

function getNotificationIcon(type: string) {
    if (type.includes('Announcement')) return <Megaphone className="size-5" />;
    if (type.includes('ForumReply')) return <MessageSquare className="size-5" />;
    return <Bell className="size-5" />;
}

function getNotificationLink(data: NotificationData): string {
    if (data.announcement_id) return `/announcements/${data.announcement_id}`;
    if (data.thread_slug) return `/forum/${data.thread_slug}`;
    return '#';
}

function getNotificationTitle(data: NotificationData): string {
    if (data.type === 'announcement') return data.title || 'New Announcement';
    if (data.type === 'forum_reply') return `Reply to "${data.thread_title}"`;
    return data.title || 'Notification';
}

function getNotificationMessage(data: NotificationData): string {
    if (data.type === 'announcement') return `${data.author}: ${data.message}`;
    if (data.type === 'forum_reply') return `${data.reply_by}: ${data.message}`;
    return data.message || '';
}

export default function NotificationsIndex({ notifications, unreadCount }: Props) {
    function handleMarkAsRead(id: string) {
        fetch(`/notifications/${id}/read`, { method: 'PATCH', headers: { 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' } })
            .then(() => router.reload());
    }

    function handleMarkAllAsRead() {
        fetch('/notifications/mark-all-read', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' } })
            .then(() => router.reload());
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                            <Bell className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                            <p className="text-sm text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="mr-2 size-4" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 py-16 dark:border-sidebar-border">
                        <Bell className="mb-4 size-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-muted-foreground">No notifications</h3>
                        <p className="mt-1 text-sm text-muted-foreground/70">You'll be notified about important updates.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${notification.read_at
                                        ? 'border-sidebar-border/70 dark:border-sidebar-border'
                                        : 'border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20'
                                    }`}
                            >
                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${notification.read_at
                                        ? 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                    }`}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={getNotificationLink(notification.data)}
                                        className="font-medium text-sm text-gray-900 dark:text-white hover:text-primary"
                                    >
                                        {getNotificationTitle(notification.data)}
                                    </Link>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                        {getNotificationMessage(notification.data)}
                                    </p>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="size-3" />
                                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!notification.read_at && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <Check className="size-4" />
                                        </Button>
                                    )}
                                    {!notification.read_at && (
                                        <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {notifications.prev_page_url && (
                            <Link href={notifications.prev_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Previous
                            </Link>
                        )}
                        <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                            Page {notifications.current_page} of {notifications.last_page}
                        </span>
                        {notifications.next_page_url && (
                            <Link href={notifications.next_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
