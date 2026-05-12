<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\LearningSession;
use App\Models\SessionAttendance;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningSessionController extends Controller
{
    /**
     * List all sessions (teachers see their own; admins see all).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = LearningSession::with(['module.subject', 'teacher']);

        if ($user->isTeacher()) {
            $query->where('teacher_id', $user->id);
        }

        if ($moduleId = $request->input('module')) {
            $query->where('module_id', $moduleId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sessions = $query->orderBy('scheduled_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $modulesQuery = LearningModule::published()->with('subject');
        if ($user->isTeacher()) {
            $modulesQuery->where('created_by', $user->id);
        }
        $modules = $modulesQuery->orderBy('title')->get(['id', 'title', 'slug', 'level', 'subject_id']);

        // Upcoming sessions for calendar view (next 60 days)
        $upcomingQuery = LearningSession::with(['module.subject', 'teacher'])
            ->where('scheduled_at', '>=', now())
            ->where('scheduled_at', '<=', now()->addDays(60))
            ->where('status', '!=', 'cancelled');

        if ($user->isTeacher()) {
            $upcomingQuery->where('teacher_id', $user->id);
        }

        $calendarEvents = $upcomingQuery->orderBy('scheduled_at')->get()->map(fn ($s) => [
            'id' => $s->id,
            'title' => $s->title,
            'module' => $s->module?->title,
            'start' => $s->scheduled_at->toISOString(),
            'end' => $s->ends_at,
            'status' => $s->status,
            'mode' => $s->mode_label,
            'location' => $s->location,
        ]);

        return Inertia::render('sessions/index', [
            'sessions' => $sessions,
            'modules' => $modules,
            'calendarEvents' => $calendarEvents,
            'filters' => $request->only(['module', 'status']),
        ]);
    }

    /**
     * Show session detail with attendance roster.
     */
    public function show(LearningSession $session, Request $request): Response
    {
        $user = $request->user();

        if ($user->isTeacher() && $session->teacher_id !== $user->id) {
            abort(403);
        }

        $session->load(['module.subject', 'teacher', 'attendances.student', 'attendances.markedBy']);

        // Build roster from students enrolled in this module
        $enrolledStudents = Enrollment::where('module_id', $session->module_id)
            ->whereIn('status', ['enrolled', 'in_progress', 'completed'])
            ->with('student:id,name,email')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->student->id,
                'name' => $e->student->name,
                'email' => $e->student->email,
                'enrollment_id' => $e->id,
            ]);

        $attendanceMap = $session->attendances->keyBy('student_id')->map(fn ($a) => [
            'id' => $a->id,
            'status' => $a->status,
            'status_label' => $a->status_label,
            'remarks' => $a->remarks,
            'marked_at' => $a->marked_at?->toISOString(),
            'marked_by' => $a->markedBy?->name,
        ]);

        // Stats
        $total = $enrolledStudents->count();
        $marked = $session->attendances->count();
        $present = $session->attendances->where('status', 'present')->count();
        $absent = $session->attendances->where('status', 'absent')->count();
        $late = $session->attendances->where('status', 'late')->count();
        $excused = $session->attendances->where('status', 'excused')->count();

        return Inertia::render('sessions/show', [
            'session' => $session,
            'roster' => $enrolledStudents->values(),
            'attendanceMap' => $attendanceMap,
            'stats' => compact('total', 'marked', 'present', 'absent', 'late', 'excused'),
        ]);
    }

    /**
     * Store a new learning session.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'module_id' => ['required', 'exists:learning_modules,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'location' => ['nullable', 'string', 'max:255'],
            'mode' => ['required', 'in:in_person,online,hybrid'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        LearningSession::create([
            ...$validated,
            'teacher_id' => $user->id,
            'status' => 'upcoming',
        ]);

        return back()->with('success', 'Session scheduled successfully.');
    }

    /**
     * Update an existing session.
     */
    public function update(LearningSession $session, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $session->teacher_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'location' => ['nullable', 'string', 'max:255'],
            'mode' => ['required', 'in:in_person,online,hybrid'],
            'status' => ['required', 'in:upcoming,ongoing,completed,cancelled'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $session->update($validated);

        return back()->with('success', 'Session updated.');
    }

    /**
     * Delete a session.
     */
    public function destroy(LearningSession $session, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $session->teacher_id !== $user->id) {
            abort(403);
        }

        $session->delete();

        return redirect()->route('sessions.index')->with('success', 'Session deleted.');
    }

    /**
     * Mark / update attendance for a student in a session.
     */
    public function markAttendance(LearningSession $session, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $session->teacher_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'status' => ['required', 'in:present,absent,late,excused'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        SessionAttendance::updateOrCreate(
            ['session_id' => $session->id, 'student_id' => $validated['student_id']],
            [
                'marked_by' => $user->id,
                'status' => $validated['status'],
                'remarks' => $validated['remarks'] ?? null,
                'marked_at' => now(),
            ]
        );

        return back()->with('success', 'Attendance recorded.');
    }

    /**
     * Bulk-mark all remaining (unmarked) students as absent.
     */
    public function bulkAbsent(LearningSession $session, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isTeacher() && $session->teacher_id !== $user->id) {
            abort(403);
        }

        $markedIds = $session->attendances()->pluck('student_id')->toArray();

        $enrolled = Enrollment::where('module_id', $session->module_id)
            ->whereIn('status', ['enrolled', 'in_progress', 'completed'])
            ->whereNotIn('student_id', $markedIds)
            ->pluck('student_id');

        foreach ($enrolled as $studentId) {
            SessionAttendance::create([
                'session_id' => $session->id,
                'student_id' => $studentId,
                'marked_by' => $user->id,
                'status' => 'absent',
                'marked_at' => now(),
            ]);
        }

        return back()->with('success', 'Unmarked students set to absent.');
    }

    /**
     * View attendance history for a specific learner.
     */
    public function learnerHistory(User $student, Request $request): Response
    {
        $user = $request->user();

        // Students can only view their own history
        if ($user->isStudent() && $user->id !== $student->id) {
            abort(403);
        }

        $attendances = SessionAttendance::where('student_id', $student->id)
            ->with(['session.module.subject', 'session.teacher', 'markedBy'])
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'total' => SessionAttendance::where('student_id', $student->id)->count(),
            'present' => SessionAttendance::where('student_id', $student->id)->where('status', 'present')->count(),
            'absent' => SessionAttendance::where('student_id', $student->id)->where('status', 'absent')->count(),
            'late' => SessionAttendance::where('student_id', $student->id)->where('status', 'late')->count(),
            'excused' => SessionAttendance::where('student_id', $student->id)->where('status', 'excused')->count(),
        ];

        return Inertia::render('sessions/attendance-history', [
            'student' => $student->only(['id', 'name', 'email', 'role']),
            'attendances' => $attendances,
            'summary' => $summary,
        ]);
    }

    /**
     * Log time spent by a student on a module (called periodically from front end).
     */
    public function logTime(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'enrollment_id' => ['required', 'exists:enrollments,id'],
            'seconds' => ['required', 'integer', 'min:1', 'max:3600'],
        ]);

        $user = $request->user();
        $enrollment = Enrollment::where('id', $validated['enrollment_id'])
            ->where('student_id', $user->id)
            ->firstOrFail();

        $enrollment->increment('time_spent_seconds', $validated['seconds']);
        $enrollment->update(['last_accessed_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
