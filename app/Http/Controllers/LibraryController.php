<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    /**
     * Display the learning library with published modules.
     */
    public function index(Request $request): Response
    {
        $query = LearningModule::published()->with(['subject', 'creator', 'resources']);

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

        // Filter by resource type
        if ($type = $request->input('type')) {
            $query->whereHas('resources', function ($q) use ($type) {
                $q->where('type', $type);
            });
        }

        $modules = $query->orderBy('title')
            ->paginate(12)
            ->withQueryString();

        // Get current user's enrollment statuses for each module
        $user = $request->user();
        $enrollmentMap = [];
        if ($user) {
            $enrollments = Enrollment::where('student_id', $user->id)
                ->whereIn('module_id', $modules->pluck('id'))
                ->get(['module_id', 'status', 'completed_at']);

            foreach ($enrollments as $enrollment) {
                $enrollmentMap[$enrollment->module_id] = [
                    'status' => $enrollment->status,
                    'completed_at' => $enrollment->completed_at?->toISOString(),
                ];
            }
        }

        return Inertia::render('library/index', [
            'modules' => $modules,
            'subjects' => Subject::orderBy('name')->get(),
            'filters' => $request->only(['search', 'subject', 'level', 'type']),
            'enrollmentMap' => $enrollmentMap,
        ]);
    }

    /**
     * Display a specific module and its resources.
     */
    public function show(LearningModule $module): Response
    {
        // Only allow viewing published modules (unless admin/teacher)
        $user = request()->user();
        if ($module->status !== 'published' && $user->isStudent()) {
            abort(403, 'This module is not yet available.');
        }

        $module->load(['subject', 'creator', 'resources.uploader']);

        // Get enrollment status for current user
        $enrollment = null;
        if ($user) {
            $enrollment = Enrollment::where('student_id', $user->id)
                ->where('module_id', $module->id)
                ->first(['id', 'status', 'completed_at']);
        }

        return Inertia::render('library/show', [
            'module' => $module,
            'enrollment' => $enrollment,
        ]);
    }
}
