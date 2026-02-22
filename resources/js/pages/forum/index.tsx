import { Head, Link, router } from '@inertiajs/react';
import { Clock, MessageSquare, Pin, Plus, Search, User } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Forum', href: '/forum' },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    threads_count: number;
}

interface ThreadUser {
    id: number;
    name: string;
    role: string;
}

interface ForumThread {
    id: number;
    title: string;
    slug: string;
    body: string;
    is_pinned: boolean;
    is_locked: boolean;
    user: ThreadUser;
    category: { id: number; name: string; slug: string; color: string };
    replies_count: number;
    reply_count: number;
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
    categories: Category[];
    threads: PaginatedData<ForumThread>;
    filters: { category: string; search: string };
    [key: string]: unknown;
}

const roleBadgeColors: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
};

export default function ForumIndex({ categories, threads, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/forum', { search, category: filters.category }, { preserveState: true });
    }

    function handleCategoryFilter(slug: string) {
        router.get('/forum', { category: slug === filters.category ? '' : slug, search: filters.search }, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Community Forum" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
                            <MessageSquare className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
                            <p className="text-sm text-muted-foreground">Ask questions, share ideas, and connect</p>
                        </div>
                    </div>
                    <Link href="/forum/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            New Thread
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search threads..."
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="outline">Search</Button>
                    </form>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategoryFilter('')}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${!filters.category
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-sidebar-border/70 hover:bg-muted dark:border-sidebar-border'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryFilter(cat.slug)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filters.category === cat.slug
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-sidebar-border/70 hover:bg-muted dark:border-sidebar-border'
                                }`}
                        >
                            {cat.name} ({cat.threads_count})
                        </button>
                    ))}
                </div>

                {/* Threads List */}
                {threads.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 py-16 dark:border-sidebar-border">
                        <MessageSquare className="mb-4 size-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-muted-foreground">No threads found</h3>
                        <p className="mt-1 text-sm text-muted-foreground/70">Be the first to start a discussion!</p>
                        <Link href="/forum/create" className="mt-4">
                            <Button variant="outline">
                                <Plus className="mr-2 size-4" />
                                Create Thread
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {threads.data.map((thread) => (
                            <Link
                                key={thread.id}
                                href={`/forum/${thread.slug}`}
                                className="group block rounded-xl border border-sidebar-border/70 p-4 transition-colors hover:bg-muted/50 dark:border-sidebar-border"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                        <User className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {thread.is_pinned && <Pin className="size-3 text-amber-500 shrink-0" />}
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary truncate">
                                                {thread.title}
                                            </h3>
                                            {thread.is_locked && (
                                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                                    Locked
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                            {thread.body.replace(/<[^>]*>/g, '')}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                                style={{ borderColor: thread.category.color, color: thread.category.color }}
                                            >
                                                {thread.category.name}
                                            </Badge>
                                            <span className="flex items-center gap-1">
                                                <User className="size-3" />
                                                {thread.user.name}
                                            </span>
                                            <Badge variant="outline" className={`text-xs ${roleBadgeColors[thread.user.role]}`}>
                                                {thread.user.role}
                                            </Badge>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="size-3" />
                                                {thread.replies_count} {thread.replies_count === 1 ? 'reply' : 'replies'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {new Date(thread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {threads.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {threads.prev_page_url && (
                            <Link href={threads.prev_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Previous
                            </Link>
                        )}
                        <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                            Page {threads.current_page} of {threads.last_page}
                        </span>
                        {threads.next_page_url && (
                            <Link href={threads.next_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
