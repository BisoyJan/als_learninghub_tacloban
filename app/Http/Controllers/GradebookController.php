<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AeTestResult;
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
     * List unique students enrolled by the teacher (or all for admins).
     */
    public function students(Request $request): Response
    {
        $user = $request->user();
        $query = Enrollment::with(['student', 'module.subject']);

        if ($user->isTeacher()) {
            $query->where('enrolled_by', $user->id);
        }

        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Group enrollments by student
        $enrollments = $query->orderBy('created_at', 'desc')->get();

        $students = $enrollments->groupBy('student_id')->map(function ($group) {
            $student = $group->first()->student;
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'enrollments_count' => $group->count(),
                'completed_count' => $group->where('status', 'completed')->count(),
                'in_progress_count' => $group->where('status', 'in_progress')->count(),
                'modules' => $group->map(fn ($e) => [
                    'id' => $e->module->id,
                    'title' => $e->module->title,
                    'subject' => $e->module->subject?->name,
                    'status' => $e->status,
                    'status_label' => $e->status_label,
                    'enrollment_id' => $e->id,
                ])->values(),
            ];
        })->values();

        // Simple pagination
        $page = (int) $request->input('page', 1);
        $perPage = 15;
        $paginated = $students->forPage($page, $perPage);

        return Inertia::render('gradebook/students', [
            'students' => [
                'data' => $paginated->values(),
                'total' => $students->count(),
                'current_page' => $page,
                'last_page' => (int) ceil($students->count() / $perPage),
            ],
            'filters' => $request->only(['search']),
        ]);
    }

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
            ->get(['id', 'name', 'email', 'education_level']);

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

        $user = $request->user();

        // Teachers can only enroll students into modules they created
        if ($user->isTeacher()) {
            $module = LearningModule::find($validated['module_id']);
            if (! $module || $module->created_by !== $user->id) {
                abort(403, 'You can only enroll students into your own modules.');
            }
        }

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
            'enrolled_by' => $user->id,
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
            'aeResults' => $enrollment->student->aeTestResults()->with('recordedBy')->get(),
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
            'competency_level' => ['nullable', 'in:beginning,developing,proficient,mastered'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'recorded_date' => ['required', 'date'],
        ]);

        // Auto-derive the competency band from the score when not set explicitly.
        if (empty($validated['competency_level']) && isset($validated['score'])) {
            $max = $validated['max_score'] ?? null;
            $percentage = ($max && $max > 0)
                ? round(($validated['score'] / $max) * 100, 1)
                : (float) $validated['score'];
            $validated['competency_level'] = ProgressRecord::deriveCompetencyLevel($percentage);
        }

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

    /**
     * Record an ALS A&E (Accreditation & Equivalency) test result for a learner.
     */
    public function storeAeResult(Enrollment $enrollment, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'level' => ['required', 'in:elementary,junior_high'],
            'test_date' => ['required', 'date'],
            'overall_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'result' => ['required', 'in:passed,failed'],
            'certificate_no' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        AeTestResult::updateOrCreate(
            ['student_id' => $enrollment->student_id, 'level' => $validated['level']],
            [...$validated, 'recorded_by' => $user->id],
        );

        return back()->with('success', 'A&E test result saved.');
    }

    /**
     * Delete an ALS A&E test result.
     */
    public function deleteAeResult(Enrollment $enrollment, AeTestResult $aeResult, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $enrollment->enrolled_by !== $user->id) {
            abort(403);
        }

        $aeResult->delete();

        return back()->with('success', 'A&E test result deleted.');
    }
}
