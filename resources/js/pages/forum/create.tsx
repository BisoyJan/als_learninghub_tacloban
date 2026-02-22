import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
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
    { title: 'Forum', href: '/forum' },
    { title: 'New Thread', href: '/forum/create' },
];

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
    [key: string]: unknown;
}

export default function ForumCreate({ categories }: Props) {
    const form = useForm({
        title: '',
        body: '',
        category_id: categories.length > 0 ? String(categories[0].id) : '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/forum');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Thread" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Back Link */}
                <div>
                    <Link href="/forum" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to Forum
                    </Link>
                </div>

                {/* Form */}
                <div className="mx-auto w-full max-w-2xl">
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Thread</h1>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={form.data.category_id}
                                    onValueChange={(value) => form.setData('category_id', value)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.category_id && <p className="mt-1 text-sm text-red-500">{form.errors.category_id}</p>}
                            </div>
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="What's your question or topic?"
                                />
                                {form.errors.title && <p className="mt-1 text-sm text-red-500">{form.errors.title}</p>}
                            </div>
                            <div>
                                <Label htmlFor="body">Content</Label>
                                <Textarea
                                    id="body"
                                    value={form.data.body}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('body', e.target.value)}
                                    placeholder="Describe your question or topic in detail..."
                                    rows={8}
                                />
                                {form.errors.body && <p className="mt-1 text-sm text-red-500">{form.errors.body}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={form.processing}>
                                    <Send className="mr-2 size-4" />
                                    Post Thread
                                </Button>
                                <Link href="/forum">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
