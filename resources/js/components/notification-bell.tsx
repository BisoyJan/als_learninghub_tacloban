import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    function fetchCount() {
        fetch('/notifications/unread-count')
            .then((res) => res.json())
            .then((data) => setUnreadCount(data.count))
            .catch(() => { });
    }

    return (
        <Link
            href="/notifications"
            className="relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Notifications"
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
                <span
                    className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                    aria-hidden="true"
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
