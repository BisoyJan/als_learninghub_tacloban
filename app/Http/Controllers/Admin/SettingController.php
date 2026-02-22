<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the system settings page.
     */
    public function index(): Response
    {
        $settings = [
            'school_year' => SystemSetting::getValue('school_year', ''),
            'term' => SystemSetting::getValue('term', '1st Semester'),
            'center_name' => SystemSetting::getValue('center_name', 'Anibong, Tacloban City Learning Center'),
            'center_address' => SystemSetting::getValue('center_address', 'Anibong, Tacloban City'),
            'contact_email' => SystemSetting::getValue('contact_email', ''),
            'contact_phone' => SystemSetting::getValue('contact_phone', ''),
            'enrollment_open' => SystemSetting::getValue('enrollment_open', 'true'),
            'max_students_per_class' => SystemSetting::getValue('max_students_per_class', '40'),
        ];

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_year' => ['required', 'string', 'max:50'],
            'term' => ['required', 'string', 'max:50'],
            'center_name' => ['required', 'string', 'max:255'],
            'center_address' => ['required', 'string', 'max:500'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'enrollment_open' => ['required', 'string', 'in:true,false'],
            'max_students_per_class' => ['required', 'integer', 'min:1', 'max:200'],
        ]);

        SystemSetting::setValue('school_year', $validated['school_year'], 'academic');
        SystemSetting::setValue('term', $validated['term'], 'academic');
        SystemSetting::setValue('center_name', $validated['center_name'], 'general');
        SystemSetting::setValue('center_address', $validated['center_address'], 'general');
        SystemSetting::setValue('contact_email', $validated['contact_email'] ?? '', 'general');
        SystemSetting::setValue('contact_phone', $validated['contact_phone'] ?? '', 'general');
        SystemSetting::setValue('enrollment_open', $validated['enrollment_open'], 'academic');
        SystemSetting::setValue('max_students_per_class', (string) $validated['max_students_per_class'], 'academic');

        return back()->with('success', 'Settings updated successfully.');
    }
}
