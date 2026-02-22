import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, Lock, MessageSquare, Pin, Send, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Forum', href: '/forum' },
    { title: 'Thread', href: '#' },
];

interface ThreadUser {
    id: number;
    name: string;
    role: string;
}

interface Reply {
    id: number;
    body: string;
    user: ThreadUser;
    created_at: string;
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
    replies: Reply[];
    created_at: string;
}

interface Props {
    thread: ForumThread;
    [key: string]: unknown;
}

const roleBadgeColors: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
};

export default function ForumShow({ thread }: Props) {
    const { auth, flash } = usePage<{ auth: { user: { id: number; role: string } }; flash: { success?: string; error?: string } }>().props;
    const isAdmin = auth.user.role === 'admin';
    const isOwner = auth.user.id === thread.user.id;

    const replyForm = useForm({ body: '' });

    function handleReply(e: React.FormEvent) {
        e.preventDefault();
        replyForm.post(`/forum/${thread.slug}/reply`, {
            onSuccess: () => replyForm.reset(),
        });
    }

    function handleDeleteThread() {
        if (confirm('Are you sure you want to delete this thread and all its replies?')) {
            router.delete(`/forum/threads/${thread.id}`);
        }
    }

    function handleDeleteReply(replyId: number) {
        if (confirm('Are you sure you want to delete this reply?')) {
            router.delete(`/forum/replies/${replyId}`);
        }
    }

    function handleToggleLock() {
        router.patch(`/forum/threads/${thread.id}/lock`);
    }

    function handleTogglePin() {
        router.patch(`/forum/threads/${thread.id}/pin`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={thread.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back Link */}
                <div>
                    <Link href="/forum" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to Forum
                    </Link>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {flash.error}
                    </div>
                )}

                {/* Thread Header & Body */}
                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {thread.is_pinned && <Pin className="size-4 text-amber-500" />}
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {thread.title}
                                </h1>
                                {thread.is_locked && (
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                        <Lock className="mr-1 size-3" />
                                        Locked
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Badge
                                    variant="outline"
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
                                    <Clock className="size-3" />
                                    {new Date(thread.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {isAdmin && (
                                <>
                                    <Button variant="ghost" size="sm" onClick={handleTogglePin} title={thread.is_pinned ? 'Unpin' : 'Pin'}>
                                        <Pin className={`size-4 ${thread.is_pinned ? 'text-amber-500' : ''}`} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleToggleLock} title={thread.is_locked ? 'Unlock' : 'Lock'}>
                                        <Lock className={`size-4 ${thread.is_locked ? 'text-red-500' : ''}`} />
                                    </Button>
                                </>
                            )}
                            {(isOwner || isAdmin) && (
                                <Button variant="ghost" size="sm" onClick={handleDeleteThread} title="Delete thread">
                                    <Trash2 className="size-4 text-red-500" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                        {thread.body}
                    </div>
                </div>

                {/* Replies */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="size-5" />
                        Replies ({thread.replies.length})
                    </h2>

                    {thread.replies.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 p-6 text-center dark:border-sidebar-border">
                            <p className="text-sm text-muted-foreground">No replies yet. Be the first to respond!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {thread.replies.map((reply) => (
                                <div key={reply.id} className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                                                <User className="size-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm text-gray-900 dark:text-white">{reply.user.name}</span>
                                                    <Badge variant="outline" className={`text-xs ${roleBadgeColors[reply.user.role]}`}>
                                                        {reply.user.role}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                    {reply.body}
                                                </p>
                                            </div>
                                        </div>
                                        {(auth.user.id === reply.user.id || isAdmin) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteReply(reply.id)}
                                                title="Delete reply"
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reply Form */}
                {!thread.is_locked ? (
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h3 className="font-semibold mb-3">Post a Reply</h3>
                        <form onSubmit={handleReply} className="space-y-3">
                            <Textarea
                                value={replyForm.data.body}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => replyForm.setData('body', e.target.value)}
                                placeholder="Write your reply..."
                                rows={4}
                            />
                            {replyForm.errors.body && <p className="text-sm text-red-500">{replyForm.errors.body}</p>}
                            <Button type="submit" disabled={replyForm.processing}>
                                <Send className="mr-2 size-4" />
                                Post Reply
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="rounded-xl border border-sidebar-border/70 p-6 text-center dark:border-sidebar-border">
                        <Lock className="mx-auto mb-2 size-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">This thread is locked. No new replies can be posted.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
