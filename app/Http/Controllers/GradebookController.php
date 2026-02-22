<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GradebookController extends Controller
{
    /**
     * Teacher gradebook: list all enrollments across their modules.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Enrollment::with(['student', 'module.subject', 'progressRecords']);

        // For teachers: show enrollments they created.
        // For admins: show all enrollments.
        if ($user->isTeacher()) {
            $query->where('enrolled_by', $user->id);
        }

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($moduleId = $request->input('module')) {
            $query->where('module_id', $moduleId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $enrollments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get modules for filter dropdown
        $modulesQuery = LearningModule::published()->with('subject');
        if ($user->isTeacher()) {
            $modulesQuery->where('created_by', $user->id);
        }
        $modules = $modulesQuery->orderBy('title')->get();

        // Get students for enrollment form
        $students = User::where('role', 'student')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('gradebook/index', [
            'enrollments' => $enrollments,
            'modules' => $modules,
            'students' => $students,
            'filters' => $request->only(['search', 'module', 'status']),
        ]);
    }

    /**
     * Enroll a student in a module.
     */
    public function enroll(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'module_id' => ['required', 'exists:learning_modules,id'],
        ]);

        // Check if already enrolled
        $existing = Enrollment::where('student_id', $validated['student_id'])
            ->where('module_id', $validated['module_id'])
            ->first();

        if ($existing) {
            return back()->with('error', 'This student is already enrolled in this module.');
        }

        Enrollment::create([
            'student_id' => $validated['student_id'],
            'module_id' => $validated['module_id'],
            'enrolled_by' => $request->user()->id,
            'status' => 'enrolled',
        ]);

        return back()->with('success', 'Student enrolled successfully.');
    }

    /**
     * View a specific enrollment with progress records.
     */
    public function show(Enrollment $enrollment, Request $request): Response
    {
        $user = $request->user();

        // Teachers can only view enrollments they created
        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $enrollment->load([
            'student',
            'module.subject',
            'module.resources',
            'progressRecords.recordedBy',
        ]);

        return Inertia::render('gradebook/show', [
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Add a progress record to an enrollment.
     */
    public function addRecord(Enrollment $enrollment, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:assessment,activity,milestone'],
            'score' => ['nullable', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'recorded_date' => ['required', 'date'],
        ]);

        $enrollment->progressRecords()->create([
            ...$validated,
            'recorded_by' => $user->id,
        ]);

        // Auto-update enrollment status to in_progress if still enrolled
        if ($enrollment->status === 'enrolled') {
            $enrollment->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Progress record added.');
    }

    /**
     * Delete a progress record.
     */
    public function deleteRecord(Enrollment $enrollment, ProgressRecord $record, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $record->delete();

        return back()->with('success', 'Progress record deleted.');
    }

    /**
     * Update enrollment status (mark as completed/dropped).
     */
    public function updateStatus(Enrollment $enrollment, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:enrolled,in_progress,completed,dropped'],
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'completed') {
            $data['completed_at'] = now();
        } else {
            $data['completed_at'] = null;
        }

        $enrollment->update($data);

        // Award badges if completed
        if ($validated['status'] === 'completed') {
            $badgeService = new BadgeService();
            $badgeService->checkAndAwardBadges($enrollment->student, $enrollment);
        }

        return back()->with('success', 'Enrollment status updated.');
    }
}
