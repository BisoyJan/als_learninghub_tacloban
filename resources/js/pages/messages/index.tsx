import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Inbox, Mail, MailOpen, Plus, Send, Trash2, X } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

interface User { id: number; name: string; role: string }

interface Message {
    id: number;
    subject: string | null;
    body: string;
    preview?: string;
    read_at: string | null;
    created_at: string;
    sender?: User;
    recipient?: User;
}

interface PaginatedMessages {
    data: Message[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    inbox: PaginatedMessages;
    sent: PaginatedMessages;
    recipients: User[];
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Messages', href: '/messages' },
];

const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30',
    teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
    student: 'bg-green-100 text-green-700 dark:bg-green-900/30',
};

function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
        return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function MessagesIndex({ inbox, sent, recipients, unreadCount }: Props) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
    const [selected, setSelected] = useState<Message | null>(null);
    const [showCompose, setShowCompose] = useState(false);

    const form = useForm({ recipient_id: '', subject: '', body: '' });

    function selectMessage(msg: Message, type: 'inbox' | 'sent') {
        setSelected(msg);
        // Mark as read if it's an inbox message and unread
        if (type === 'inbox' && !msg.read_at) {
            router.patch(`/messages/${msg.id}/read`, {}, { preserveState: true, replace: true });
        }
    }

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        form.post('/messages', {
            onSuccess: () => { form.reset(); setShowCompose(false); },
        });
    }

    function handleDelete(msg: Message) {
        if (!confirm('Delete this message?')) return;
        router.delete(`/messages/${msg.id}`, {
            onSuccess: () => { if (selected?.id === msg.id) setSelected(null); },
        });
    }

    const activeMessages = tab === 'inbox' ? inbox.data : sent.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            <div className="flex h-full flex-1 flex-col gap-0 p-4 md:p-6">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <Button onClick={() => setShowCompose(true)}>
                        <Plus className="size-4 mr-1" /> Compose
                    </Button>
                </div>

                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                {/* Main Layout: sidebar + reading pane */}
                <div className="flex flex-1 gap-0 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">

                    {/* Left Sidebar — message list */}
                    <div className="w-full max-w-xs flex-shrink-0 border-r border-sidebar-border/70 dark:border-sidebar-border flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <button
                                onClick={() => setTab('inbox')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === 'inbox'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Inbox className="size-4" />
                                Inbox
                                {unreadCount > 0 && (
                                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[1.25rem] text-center">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </button>
                            <button
                                onClick={() => setTab('sent')}
                                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${tab === 'sent'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                <Send className="size-4" />
                                Sent
                            </button>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-sidebar-border/40 dark:divide-sidebar-border/30">
                            {activeMessages.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    {tab === 'inbox' ? 'Your inbox is empty.' : 'No sent messages.'}
                                </div>
                            ) : (
                                activeMessages.map((msg) => {
                                    const isUnread = tab === 'inbox' && !msg.read_at;
                                    const contact = tab === 'inbox' ? msg.sender : msg.recipient;
                                    return (
                                        <button
                                            key={msg.id}
                                            onClick={() => selectMessage(msg, tab)}
                                            className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${selected?.id === msg.id ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {contact?.name ?? 'Unknown'}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatTime(msg.created_at)}
                                                </span>
                                            </div>
                                            {msg.subject && (
                                                <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-muted-foreground'}`}>
                                                    {msg.subject}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {msg.body.slice(0, 60)}
                                            </p>
                                            {isUnread && (
                                                <div className="mt-1 w-2 h-2 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Reading Pane */}
                    <div className="flex-1 flex flex-col">
                        {selected ? (
                            <>
                                <div className="flex items-center justify-between border-b border-sidebar-border/70 dark:border-sidebar-border px-6 py-4">
                                    <div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">
                                            {selected.subject ?? '(No subject)'}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {tab === 'inbox' ? (
                                                <>
                                                    <span className="text-xs text-muted-foreground">From: {selected.sender?.name}</span>
                                                    {selected.sender?.role && (
                                                        <span className={`text-xs rounded px-1.5 py-0.5 ${roleColors[selected.sender.role] ?? ''}`}>
                                                            {selected.sender.role}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">To: {selected.recipient?.name}</span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                · {new Date(selected.created_at).toLocaleString('en-PH', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: 'numeric', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(selected)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-5">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {selected.body}
                                    </p>
                                </div>
                                {/* Quick Reply */}
                                {tab === 'inbox' && selected.sender && (
                                    <div className="border-t border-sidebar-border/70 dark:border-sidebar-border px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                form.setData('recipient_id', String(selected.sender!.id));
                                                form.setData('subject', selected.subject ? `Re: ${selected.subject}` : '');
                                                setShowCompose(true);
                                            }}
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <MailOpen className="mx-auto size-10 opacity-30 mb-2" />
                                    <p className="text-sm">Select a message to read</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compose Modal */}
                {showCompose && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl">
                            <div className="flex items-center justify-between border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Mail className="size-4" /> New Message
                                </h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowCompose(false)}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <form onSubmit={handleSend} className="p-5 space-y-4">
                                <div>
                                    <Label>To</Label>
                                    <Select
                                        value={form.data.recipient_id}
                                        onValueChange={(v) => form.setData('recipient_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {recipients.map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.name} ({r.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.recipient_id && (
                                        <p className="text-xs text-red-500 mt-1">{form.errors.recipient_id}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Subject (optional)</Label>
                                    <Input
                                        value={form.data.subject}
                                        onChange={(e) => form.setData('subject', e.target.value)}
                                        placeholder="Subject"
                                    />
                                </div>
                                <div>
                                    <Label>Message</Label>
                                    <Textarea
                                        value={form.data.body}
                                        onChange={(e) => form.setData('body', e.target.value)}
                                        placeholder="Write your message..."
                                        rows={6}
                                    />
                                    {form.errors.body && (
                                        <p className="text-xs text-red-500 mt-1">{form.errors.body}</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        <Send className="size-4 mr-1" /> Send
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
