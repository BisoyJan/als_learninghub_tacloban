import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    Clock,
    List,
    MapPin,
    Monitor,
    Plus,
    Video,
    X,
} from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Module {
    id: number;
    title: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Session {
    id: number;
    title: string;
    description: string | null;
    scheduled_at: string;
    ends_at: string;
    duration_minutes: number;
    location: string | null;
    mode: string;
    mode_label: string;
    status: string;
    status_label: string;
    notes: string | null;
    module: Module | null;
    teacher: Teacher;
}

interface CalendarEvent {
    id: number;
    title: string;
    module: string | null;
    start: string;
    end: string;
    status: string;
    mode: string;
    location: string | null;
}

interface PaginatedSessions {
    data: Session[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    sessions: PaginatedSessions;
    modules: Module[];
    calendarEvents: CalendarEvent[];
    filters: { module?: string; status?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Sessions', href: '/sessions' },
];

const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
    ongoing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
};

const modeIcons: Record<string, typeof Monitor> = {
    in_person: MapPin,
    online: Video,
    hybrid: Monitor,
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/** Minimal calendar grid for current + next month */
function CalendarView({ events }: { events: CalendarEvent[] }) {
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const eventsByDate: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
        const d = new Date(ev.start);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const key = d.getDate().toString();
            if (!eventsByDate[key]) eventsByDate[key] = [];
            eventsByDate[key].push(ev);
        }
    });

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = viewDate.toLocaleString('en-PH', { month: 'long', year: 'numeric' });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);

    const today = new Date();

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/70 dark:border-sidebar-border">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-muted text-muted-foreground">‹</button>
                <h3 className="font-semibold text-gray-900 dark:text-white">{monthName}</h3>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-muted text-muted-foreground">›</button>
            </div>
            {/* Days header */}
            <div className="grid grid-cols-7 border-b border-sidebar-border/70 dark:border-sidebar-border">
                {dayNames.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                        {d}
                    </div>
                ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                    const isToday =
                        day !== null &&
                        today.getDate() === day &&
                        today.getMonth() === month &&
                        today.getFullYear() === year;
                    const dayEvents = day !== null ? eventsByDate[day.toString()] ?? [] : [];

                    return (
                        <div
                            key={idx}
                            className={`min-h-[72px] p-1.5 border-r border-b border-sidebar-border/40 dark:border-sidebar-border/30 ${day === null ? 'bg-muted/20' : ''
                                }`}
                        >
                            {day !== null && (
                                <>
                                    <span
                                        className={`text-xs font-medium inline-flex size-6 items-center justify-center rounded-full ${isToday
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {day}
                                    </span>
                                    <div className="mt-0.5 space-y-0.5">
                                        {dayEvents.slice(0, 2).map((ev) => (
                                            <Link
                                                key={ev.id}
                                                href={`/sessions/${ev.id}`}
                                                className="block truncate rounded px-1 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:opacity-80"
                                            >
                                                {ev.title}
                                            </Link>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <span className="block text-[10px] text-muted-foreground pl-1">
                                                +{dayEvents.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SessionsIndex({ sessions, modules, calendarEvents, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(auth.user.role);

    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    // Filters
    const [moduleFilter, setModuleFilter] = useState(filters.module ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    function applyFilters(newModule?: string, newStatus?: string) {
        const m = newModule ?? moduleFilter;
        const s = newStatus ?? statusFilter;
        router.get('/sessions', {
            module: m === 'all' ? undefined : m,
            status: s === 'all' ? undefined : s,
        }, { preserveState: true, replace: true });
    }

    const createForm = useForm({
        module_id: '',
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        mode: 'in_person',
        notes: '',
    });

    const editForm = useForm({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        location: '',
        mode: 'in_person',
        status: 'upcoming',
        notes: '',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/sessions', {
            onSuccess: () => { createForm.reset(); setShowForm(false); },
        });
    }

    function openEdit(session: Session) {
        setEditingSession(session);
        editForm.setData({
            title: session.title,
            description: session.description ?? '',
            scheduled_at: session.scheduled_at.slice(0, 16),
            duration_minutes: session.duration_minutes,
            location: session.location ?? '',
            mode: session.mode,
            status: session.status,
            notes: session.notes ?? '',
        });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingSession) return;
        editForm.put(`/sessions/${editingSession.id}`, {
            onSuccess: () => setEditingSession(null),
        });
    }

    function handleDelete(session: Session) {
        if (!confirm(`Delete "${session.title}"?`)) return;
        router.delete(`/sessions/${session.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Learning Sessions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Page header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Sessions</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Schedule, manage, and track attendance for class sessions.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('list')}
                        >
                            <List className="size-4 mr-1" /> List
                        </Button>
                        <Button
                            variant={view === 'calendar' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('calendar')}
                        >
                            <CalendarDays className="size-4 mr-1" /> Calendar
                        </Button>
                        {isTeacherOrAdmin && (
                            <Button size="sm" onClick={() => setShowForm(true)}>
                                <Plus className="size-4 mr-1" /> Schedule Session
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <Select
                        value={moduleFilter}
                        onValueChange={(v) => { setModuleFilter(v); applyFilters(v); }}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Modules" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modules</SelectItem>
                            {modules.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => { setStatusFilter(v); applyFilters(undefined, v); }}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Calendar View */}
                {view === 'calendar' && (
                    <CalendarView events={calendarEvents} />
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title / Module</TableHead>
                                    <TableHead>Scheduled</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                                            No sessions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.data.map((session) => {
                                        const ModeIcon = modeIcons[session.mode] ?? Monitor;
                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
                                                    {session.module && (
                                                        <p className="text-xs text-muted-foreground">{session.module.title}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDateTime(session.scheduled_at)}</TableCell>
                                                <TableCell className="text-sm">
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="size-3.5" />{session.duration_minutes}m
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <ModeIcon className="size-3.5" />{session.mode_label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={statusColors[session.status]}>
                                                        {session.status_label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={`/sessions/${session.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <ChevronRight className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        {isTeacherOrAdmin && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEdit(session)}
                                                                    className="text-xs"
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(session)}
                                                                    className="text-xs text-destructive hover:text-destructive"
                                                                >
                                                                    Del
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {sessions.last_page > 1 && (
                            <div className="px-5 py-3 border-t border-sidebar-border/70 dark:border-sidebar-border">
                                <Pagination links={sessions.links} />
                            </div>
                        )}
                    </div>
                )}

                {/* Create Session Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl">
                            <div className="flex items-center justify-between border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule New Session</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <form onSubmit={handleCreate} className="p-5 space-y-4">
                                <div>
                                    <Label>Module</Label>
                                    <Select value={createForm.data.module_id} onValueChange={(v) => createForm.setData('module_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                                        <SelectContent>
                                            {modules.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.module_id && <p className="text-xs text-red-500 mt-1">{createForm.errors.module_id}</p>}
                                </div>
                                <div>
                                    <Label>Session Title</Label>
                                    <Input
                                        value={createForm.data.title}
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                        placeholder="e.g. Week 3 – Reading Comprehension"
                                    />
                                    {createForm.errors.title && <p className="text-xs text-red-500 mt-1">{createForm.errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={createForm.data.scheduled_at}
                                            onChange={(e) => createForm.setData('scheduled_at', e.target.value)}
                                        />
                                        {createForm.errors.scheduled_at && <p className="text-xs text-red-500 mt-1">{createForm.errors.scheduled_at}</p>}
                                    </div>
                                    <div>
                                        <Label>Duration (minutes)</Label>
                                        <Input
                                            type="number"
                                            min={5}
                                            max={480}
                                            value={createForm.data.duration_minutes}
                                            onChange={(e) => createForm.setData('duration_minutes', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Mode</Label>
                                        <Select value={createForm.data.mode} onValueChange={(v) => createForm.setData('mode', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_person">In Person</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Location / Link</Label>
                                        <Input
                                            value={createForm.data.location}
                                            onChange={(e) => createForm.setData('location', e.target.value)}
                                            placeholder="Room 101 or meeting URL"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Description (optional)</Label>
                                    <Textarea
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createForm.processing}>Schedule</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Session Modal */}
                {editingSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl">
                            <div className="flex items-center justify-between border-b border-sidebar-border/70 px-5 py-4 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Session</h2>
                                <Button variant="ghost" size="icon" onClick={() => setEditingSession(null)}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                            <form onSubmit={handleEdit} className="p-5 space-y-4">
                                <div>
                                    <Label>Session Title</Label>
                                    <Input
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={editForm.data.scheduled_at}
                                            onChange={(e) => editForm.setData('scheduled_at', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Duration (min)</Label>
                                        <Input
                                            type="number"
                                            min={5}
                                            max={480}
                                            value={editForm.data.duration_minutes}
                                            onChange={(e) => editForm.setData('duration_minutes', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Mode</Label>
                                        <Select value={editForm.data.mode} onValueChange={(v) => editForm.setData('mode', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="in_person">In Person</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select value={editForm.data.status} onValueChange={(v) => editForm.setData('status', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Location / Link</Label>
                                    <Input
                                        value={editForm.data.location}
                                        onChange={(e) => editForm.setData('location', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Notes (optional)</Label>
                                    <Textarea
                                        value={editForm.data.notes}
                                        onChange={(e) => editForm.setData('notes', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingSession(null)}>Cancel</Button>
                                    <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
