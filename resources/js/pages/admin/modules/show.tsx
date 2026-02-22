import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    Edit,
    ExternalLink,
    FileText,
    Image,
    Link2,
    Plus,
    Trash2,
    Upload,
    Video,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Resource {
    id: number;
    title: string;
    description: string | null;
    type: string;
    file_path: string | null;
    external_url: string | null;
    file_size: number | null;
    mime_type: string | null;
    sort_order: number;
    url: string | null;
    file_size_formatted: string | null;
    uploader: { id: number; name: string };
}

interface Module {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    level: string;
    status: string;
    created_at: string;
    subject: { id: number; name: string };
    creator: { id: number; name: string };
    resources: Resource[];
}

interface Props {
    module: Module;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modules', href: '/admin/modules' },
    { title: 'Module Details', href: '#' },
];

const levelLabels: Record<string, string> = {
    elementary: 'Elementary',
    junior_high: 'Junior High School',
    senior_high: 'Senior High School',
};

const statusBadge: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
};

const typeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    document: FileText,
    video: Video,
    link: Link2,
    image: Image,
};

export default function ShowModule({ module }: Props) {
    const [showUploadForm, setShowUploadForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        type: string;
        file: File | null;
        external_url: string;
    }>({
        title: '',
        description: '',
        type: 'pdf',
        file: null,
        external_url: '',
    });

    function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/modules/${module.id}/resources`, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowUploadForm(false);
            },
        });
    }

    function handleDeleteResource(resource: Resource) {
        if (confirm(`Delete resource "${resource.title}"?`)) {
            router.delete(`/admin/modules/${module.id}/resources/${resource.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={module.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild className="mt-1">
                            <Link href="/admin/modules">
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {module.title}
                                </h1>
                                <Badge variant="outline" className={statusBadge[module.status] ?? ''}>
                                    {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                                </Badge>
                            </div>
                            {module.description && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                                    {module.description}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>Subject: <strong>{module.subject.name}</strong></span>
                                <span>Level: <strong>{levelLabels[module.level]}</strong></span>
                                <span>By: <strong>{module.creator.name}</strong></span>
                                <span>Created: {new Date(module.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/modules/${module.id}/edit`}>
                            <Edit className="size-4" />
                            Edit Module
                        </Link>
                    </Button>
                </div>

                {/* Resources Section */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="flex items-center justify-between border-b border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resources ({module.resources.length})
                        </h2>
                        <Button
                            size="sm"
                            onClick={() => setShowUploadForm(!showUploadForm)}
                            variant={showUploadForm ? 'secondary' : 'default'}
                        >
                            {showUploadForm ? 'Cancel' : (
                                <>
                                    <Plus className="size-4" />
                                    Add Resource
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Upload Form */}
                    {showUploadForm && (
                        <div className="border-b border-sidebar-border/70 bg-muted/30 p-4 dark:border-sidebar-border">
                            <form onSubmit={handleUpload} className="grid gap-4 max-w-2xl">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="res-title">Title</Label>
                                        <Input
                                            id="res-title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Resource title"
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="res-type">Type</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) => setData('type', value)}
                                        >
                                            <SelectTrigger id="res-type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="document">Document</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="image">Image</SelectItem>
                                                <SelectItem value="link">External Link</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="res-description">Description (optional)</Label>
                                    <Input
                                        id="res-description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description..."
                                    />
                                </div>

                                {data.type === 'link' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="res-url">External URL</Label>
                                        <Input
                                            id="res-url"
                                            type="url"
                                            value={data.external_url}
                                            onChange={(e) => setData('external_url', e.target.value)}
                                            placeholder="https://..."
                                            required
                                        />
                                        <InputError message={errors.external_url} />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label htmlFor="res-file">Upload File (max 50MB)</Label>
                                        <Input
                                            id="res-file"
                                            type="file"
                                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                            required
                                        />
                                        <InputError message={errors.file} />
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing} size="sm">
                                        <Upload className="size-4" />
                                        {processing ? 'Uploading...' : 'Upload Resource'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Resource List */}
                    <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                        {module.resources.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Upload className="mx-auto mb-2 size-8 opacity-40" />
                                <p>No resources yet.</p>
                                <p className="text-xs mt-1">Click "Add Resource" to upload files or add links.</p>
                            </div>
                        ) : (
                            module.resources.map((resource) => {
                                const Icon = typeIcons[resource.type] || FileText;
                                return (
                                    <div key={resource.id} className="flex items-center gap-4 px-4 py-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Icon className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">{resource.title}</p>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">
                                                    {resource.type.toUpperCase()}
                                                </Badge>
                                                {resource.file_size_formatted && (
                                                    <span>{resource.file_size_formatted}</span>
                                                )}
                                                <span>by {resource.uploader.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {resource.url && (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={resource.external_url ? 'Open link' : 'Download'}
                                                    >
                                                        {resource.external_url ? (
                                                            <ExternalLink className="size-4" />
                                                        ) : (
                                                            <Download className="size-4" />
                                                        )}
                                                    </a>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteResource(resource)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete resource"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
