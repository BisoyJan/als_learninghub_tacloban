import { Head, router, usePage } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
import { useState } from 'react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Settings', href: '/admin/settings' },
];

interface Props {
    settings: {
        school_year: string;
        term: string;
        center_name: string;
        center_address: string;
        contact_email: string;
        contact_phone: string;
        enrollment_open: string;
        max_students_per_class: string;
    };
}

export default function SettingsIndex({ settings }: Props) {
    const [form, setForm] = useState(settings);
    const [processing, setProcessing] = useState(false);
    const flash = usePage().props.flash as { success?: string } | undefined;

    function handleChange(key: keyof typeof form, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.put('/admin/settings', form, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <Settings className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure school year, terms, and learning center information.</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Academic Settings */}
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Academic Configuration</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="school_year">
                                    School Year <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="school_year"
                                    value={form.school_year}
                                    onChange={(e) => handleChange('school_year', e.target.value)}
                                    placeholder="e.g. 2025-2026"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="term">
                                    Current Term <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.term}
                                    onValueChange={(value) => handleChange('term', value)}
                                >
                                    <SelectTrigger id="term">
                                        <SelectValue placeholder="Select term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st Semester">1st Semester</SelectItem>
                                        <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                                        <SelectItem value="Summer">Summer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="enrollment_open">
                                    Enrollment Status
                                </Label>
                                <Select
                                    value={form.enrollment_open}
                                    onValueChange={(value) => handleChange('enrollment_open', value)}
                                >
                                    <SelectTrigger id="enrollment_open">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Open</SelectItem>
                                        <SelectItem value="false">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="max_students">
                                    Max Students Per Class
                                </Label>
                                <Input
                                    id="max_students"
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={form.max_students_per_class}
                                    onChange={(e) => handleChange('max_students_per_class', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Center Information */}
                    <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Learning Center Information</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="center_name">
                                    Center Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="center_name"
                                    value={form.center_name}
                                    onChange={(e) => handleChange('center_name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="center_address">
                                    Center Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="center_address"
                                    value={form.center_address}
                                    onChange={(e) => handleChange('center_address', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact_email">
                                    Contact Email
                                </Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={form.contact_email}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    placeholder="admin@alsconnect.ph"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact_phone">
                                    Contact Phone
                                </Label>
                                <Input
                                    id="contact_phone"
                                    value={form.contact_phone}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    placeholder="e.g. 09XX-XXX-XXXX"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            <Save className="size-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
