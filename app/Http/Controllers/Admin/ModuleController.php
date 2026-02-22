<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningModule;
use App\Models\LearningResource;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Display a listing of modules.
     */
    public function index(Request $request): Response
    {
        $query = LearningModule::with(['subject', 'creator', 'resources']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($subject = $request->input('subject')) {
            $query->where('subject_id', $subject);
        }

        if ($level = $request->input('level')) {
            $query->where('level', $level);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $modules = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/modules/index', [
            'modules' => $modules,
            'subjects' => Subject::orderBy('name')->get(),
            'filters' => $request->only(['search', 'subject', 'level', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new module.
     */
    public function create(): Response
    {
        return Inertia::render('admin/modules/create', [
            'subjects' => Subject::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created module.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'level' => ['required', Rule::in(['elementary', 'junior_high', 'senior_high'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['created_by'] = $request->user()->id;

        LearningModule::create($validated);

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Module created successfully.');
    }

    /**
     * Show the module details with resources.
     */
    public function show(LearningModule $module): Response
    {
        $module->load(['subject', 'creator', 'resources.uploader']);

        return Inertia::render('admin/modules/show', [
            'module' => $module,
        ]);
    }

    /**
     * Show the form for editing the specified module.
     */
    public function edit(LearningModule $module): Response
    {
        return Inertia::render('admin/modules/edit', [
            'module' => $module->load('resources'),
            'subjects' => Subject::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified module.
     */
    public function update(Request $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'level' => ['required', Rule::in(['elementary', 'junior_high', 'senior_high'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $module->update($validated);

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Module updated successfully.');
    }

    /**
     * Remove the specified module.
     */
    public function destroy(LearningModule $module): RedirectResponse
    {
        // Delete associated resource files
        foreach ($module->resources as $resource) {
            if ($resource->file_path) {
                Storage::disk('public')->delete($resource->file_path);
            }
        }

        $module->delete();

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Module deleted successfully.');
    }

    /**
     * Upload a resource to a module.
     */
    public function uploadResource(Request $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', Rule::in(['pdf', 'video', 'link', 'document', 'image'])],
            'file' => ['nullable', 'file', 'max:51200'], // 50MB max
            'external_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $resourceData = [
            'module_id' => $module->id,
            'uploaded_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'sort_order' => $module->resources()->count(),
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('modules/' . $module->id, 'public');
            $resourceData['file_path'] = $path;
            $resourceData['file_size'] = $file->getSize();
            $resourceData['mime_type'] = $file->getMimeType();
        }

        if (!empty($validated['external_url'])) {
            $resourceData['external_url'] = $validated['external_url'];
        }

        LearningResource::create($resourceData);

        return back()->with('success', 'Resource added successfully.');
    }

    /**
     * Delete a resource from a module.
     */
    public function deleteResource(LearningModule $module, LearningResource $resource): RedirectResponse
    {
        if ($resource->file_path) {
            Storage::disk('public')->delete($resource->file_path);
        }

        $resource->delete();

        return back()->with('success', 'Resource removed successfully.');
    }
}
