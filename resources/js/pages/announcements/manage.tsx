import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Clock, Edit, Megaphone, Pin, Plus, Send, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Announcements', href: '/announcements' },
    { title: 'Manage', href: '/announcements-manage' },
];

interface Author {
    id: number;
    name: string;
    role: string;
}

interface Announcement {
    id: number;
    title: string;
    body: string;
    audience: string;
    is_pinned: boolean;
    published_at: string | null;
    author: Author;
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
    announcements: PaginatedData<Announcement>;
    [key: string]: unknown;
}

const audienceColors: Record<string, string> = {
    all: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    students: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    teachers: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    admins: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

export default function AnnouncementsManage({ announcements }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({
        title: '',
        body: '',
        audience: 'all',
        is_pinned: false,
        publish_now: true,
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        form.post('/announcements-manage', {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    }

    function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editingId) return;
        form.put(`/announcements-manage/${editingId}`, {
            onSuccess: () => {
                form.reset();
                setEditingId(null);
            },
        });
    }

    function startEdit(announcement: Announcement) {
        setEditingId(announcement.id);
        setShowForm(false);
        form.setData({
            title: announcement.title,
            body: announcement.body,
            audience: announcement.audience,
            is_pinned: announcement.is_pinned,
            publish_now: true,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        form.reset();
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(`/announcements-manage/${id}`);
        }
    }

    function handlePublish(id: number) {
        router.patch(`/announcements-manage/${id}/publish`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Announcements" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                            <Megaphone className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Announcements</h1>
                            <p className="text-sm text-muted-foreground">Create and manage announcements</p>
                        </div>
                    </div>
                    <Button onClick={() => { setShowForm(!showForm); setEditingId(null); form.reset(); }}>
                        {showForm ? <X className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                        {showForm ? 'Cancel' : 'New Announcement'}
                    </Button>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Create Form */}
                {showForm && (
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold mb-4">New Announcement</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Announcement title"
                                />
                                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                            </div>
                            <div>
                                <Label htmlFor="body">Content</Label>
                                <Textarea
                                    id="body"
                                    value={form.data.body}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('body', e.target.value)}
                                    placeholder="Write your announcement..."
                                    rows={5}
                                />
                                {form.errors.body && <p className="mt-1 text-sm text-red-500">{form.errors.body}</p>}
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="audience">Target Audience</Label>
                                    <Select
                                        value={form.data.audience}
                                        onValueChange={(value) => form.setData('audience', value)}
                                    >
                                        <SelectTrigger id="audience">
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Everyone</SelectItem>
                                            <SelectItem value="students">Students Only</SelectItem>
                                            <SelectItem value="teachers">Teachers Only</SelectItem>
                                            <SelectItem value="admins">Admins Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-4">
                                    <Label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_pinned}
                                            onChange={(e) => form.setData('is_pinned', e.target.checked)}
                                            className="rounded border-gray-300"
                                            title="Pin to top"
                                        />
                                        Pin to top
                                    </Label>
                                    <Label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.publish_now}
                                            onChange={(e) => form.setData('publish_now', e.target.checked)}
                                            className="rounded border-gray-300"
                                            title="Publish immediately"
                                        />
                                        Publish immediately
                                    </Label>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={form.processing}>
                                    <Send className="mr-2 size-4" />
                                    {form.data.publish_now ? 'Publish' : 'Save as Draft'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Announcements List */}
                <div className="space-y-4">
                    {announcements.data.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border"
                        >
                            {editingId === announcement.id ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor={`edit-title-${announcement.id}`}>Title</Label>
                                        <Input
                                            id={`edit-title-${announcement.id}`}
                                            value={form.data.title}
                                            onChange={(e) => form.setData('title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`edit-body-${announcement.id}`}>Content</Label>
                                        <Textarea
                                            id={`edit-body-${announcement.id}`}
                                            value={form.data.body}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('body', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor={`edit-audience-${announcement.id}`}>Target Audience</Label>
                                            <Select
                                                value={form.data.audience}
                                                onValueChange={(value) => form.setData('audience', value)}
                                            >
                                                <SelectTrigger id={`edit-audience-${announcement.id}`}>
                                                    <SelectValue placeholder="Select audience" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Everyone</SelectItem>
                                                    <SelectItem value="students">Students Only</SelectItem>
                                                    <SelectItem value="teachers">Teachers Only</SelectItem>
                                                    <SelectItem value="admins">Admins Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.is_pinned}
                                                    onChange={(e) => form.setData('is_pinned', e.target.checked)}
                                                    className="rounded border-gray-300"
                                                    title="Pin to top"
                                                />
                                                Pin to top
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={form.processing}>Save Changes</Button>
                                        <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {announcement.is_pinned && <Pin className="size-4 text-amber-500 shrink-0" />}
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {announcement.title}
                                            </h3>
                                            {!announcement.published_at && (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                                                    Draft
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {announcement.body.replace(/<[^>]*>/g, '')}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Badge variant="outline" className={audienceColors[announcement.audience]}>
                                                <Users className="mr-1 size-3" />
                                                {announcement.audience === 'all' ? 'Everyone' : announcement.audience.charAt(0).toUpperCase() + announcement.audience.slice(1)}
                                            </Badge>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {announcement.published_at
                                                    ? new Date(announcement.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : 'Not published'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {!announcement.published_at && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePublish(announcement.id)}
                                                title="Publish"
                                            >
                                                <Send className="size-4 text-green-600" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(announcement)}
                                            title="Edit"
                                        >
                                            <Edit className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(announcement.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="size-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {announcements.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-sidebar-border/70 py-16 dark:border-sidebar-border">
                            <Megaphone className="mb-4 size-12 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium text-muted-foreground">No announcements yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground/70">Click "New Announcement" to create one.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {announcements.prev_page_url && (
                            <Link href={announcements.prev_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Previous
                            </Link>
                        )}
                        <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                            Page {announcements.current_page} of {announcements.last_page}
                        </span>
                        {announcements.next_page_url && (
                            <Link href={announcements.next_page_url} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
