import { Head, Link, router, usePage } from '@inertiajs/react';
import { Download, Edit, FileUp, Plus, Search, Trash2, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import Pagination from '@/components/pagination';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';

interface PaginatedUsers {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    users: PaginatedUsers;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

const roleBadgeColor: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
};

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showImport, setShowImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const flash = usePage().props.flash as { success?: string; error?: string; importErrors?: string[] } | undefined;

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/users', {
            search: search || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleFilterChange(role: string, status: string) {
        setRoleFilter(role);
        setStatusFilter(status);
        router.get('/admin/users', {
            search: search || undefined,
            role: role || undefined,
            status: status || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    function handleDelete(user: User) {
        if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    }

    function handleToggleStatus(user: User) {
        const action = user.is_active ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
            router.patch(`/admin/users/${user.id}/toggle-status`);
        }
    }

    function handleImport(e: React.FormEvent) {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setImporting(true);
        router.post('/admin/users-import', { file }, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                setShowImport(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            User Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage accounts, roles, and access for all platform users.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/admin/users-export?role=${roleFilter}&status=${statusFilter}`}>
                                <Download className="size-4" />
                                Export
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>
                            <Upload className="size-4" />
                            Import
                        </Button>
                        <Button asChild>
                            <Link href="/admin/users/create">
                                <Plus className="size-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Import Panel */}
                {showImport && (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Import Users from CSV</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowImport(false)}>
                                <X className="size-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleImport} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <Label htmlFor="import-file">
                                    CSV File
                                </Label>
                                <Input
                                    id="import-file"
                                    type="file"
                                    accept=".csv,.txt"
                                    ref={fileInputRef}
                                    className="file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
                                />
                            </div>
                            <Button type="submit" disabled={importing} className="sm:w-auto">
                                <FileUp className="size-4" />
                                {importing ? 'Importing...' : 'Upload & Import'}
                            </Button>
                            <Button type="button" variant="outline" asChild className="sm:w-auto">
                                <a href="/admin/users-template">
                                    <Download className="size-4" />
                                    Download Template
                                </a>
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-muted-foreground">
                            CSV must include columns: <strong>name</strong>, <strong>email</strong>, <strong>role</strong>. Optional: password, status. Default password is "password".
                        </p>
                        {flash?.importErrors && flash.importErrors.length > 0 && (
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Import Issues:</p>
                                <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                                    {flash.importErrors.map((err, i) => (
                                        <li key={i}>• {err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Filters */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">
                                Search
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="w-full sm:w-40">
                            <Label htmlFor="role-filter">
                                Role
                            </Label>
                            <Select
                                value={roleFilter || 'all'}
                                onValueChange={(v) => handleFilterChange(v === 'all' ? '' : v, statusFilter)}
                            >
                                <SelectTrigger id="role-filter">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-40">
                            <Label htmlFor="status-filter">
                                Status
                            </Label>
                            <Select
                                value={statusFilter || 'all'}
                                onValueChange={(v) => handleFilterChange(roleFilter, v === 'all' ? '' : v)}
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" variant="secondary" className="sm:w-auto">
                            <Search className="size-4" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={roleBadgeColor[user.role] ?? ''}
                                            >
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.is_active ? 'default' : 'secondary'}
                                                className={
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                }
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.is_active ? (
                                                        <ToggleRight className="size-4 text-green-600" />
                                                    ) : (
                                                        <ToggleLeft className="size-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/users/${user.id}/edit`} title="Edit">
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete"
                                                    onClick={() => handleDelete(user)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <Pagination
                                links={users.links}
                                from={users.from}
                                to={users.to}
                                total={users.total}
                            />
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="text-sm text-muted-foreground">
                    Total: {users.total} user{users.total !== 1 ? 's' : ''}
                </div>
            </div>
        </AppLayout>
    );
}
