import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
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

interface Subject {
    id: number;
    name: string;
}

interface Props {
    subjects: Subject[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Modules', href: '/admin/modules' },
    { title: 'Create Module', href: '/admin/modules/create' },
];

export default function CreateModule({ subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        subject_id: '',
        level: 'elementary',
        status: 'draft',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/modules');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Module" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/modules">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create Module
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Add a new learning module. You can add resources after creating it.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <form onSubmit={handleSubmit} className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Module Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Basic English Grammar"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of this module..."
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject_id">Subject</Label>
                                    <Select
                                        value={data.subject_id}
                                        onValueChange={(value) => setData('subject_id', value)}
                                    >
                                        <SelectTrigger id="subject_id">
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.subject_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Select
                                        value={data.level}
                                        onValueChange={(value) => setData('level', value)}
                                    >
                                        <SelectTrigger id="level">
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="elementary">Elementary</SelectItem>
                                            <SelectItem value="junior_high">Junior High School</SelectItem>
                                            <SelectItem value="senior_high">Senior High School</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.level} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft — not visible to students</SelectItem>
                                        <SelectItem value="published">Published — visible to everyone</SelectItem>
                                        <SelectItem value="archived">Archived — hidden from library</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" type="button" asChild>
                                    <Link href="/admin/modules">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Module'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
