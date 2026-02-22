<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Admin reports dashboard with aggregate analytics.
     */
    public function index(Request $request): Response
    {
        // Center-wide statistics
        $centerStats = [
            'totalStudents' => User::where('role', 'student')->count(),
            'activeStudents' => User::where('role', 'student')->where('is_active', true)->count(),
            'totalTeachers' => User::where('role', 'teacher')->count(),
            'totalModules' => LearningModule::published()->count(),
            'totalEnrollments' => Enrollment::count(),
            'completedEnrollments' => Enrollment::completed()->count(),
            'activeEnrollments' => Enrollment::active()->count(),
            'completionRate' => Enrollment::count() > 0
                ? round((Enrollment::completed()->count() / Enrollment::count()) * 100, 1)
                : 0,
        ];

        // Per-module/class breakdown
        $moduleStats = LearningModule::published()
            ->withCount([
                'enrollments',
                'enrollments as completed_count' => fn ($q) => $q->where('status', 'completed'),
                'enrollments as in_progress_count' => fn ($q) => $q->where('status', 'in_progress'),
            ])
            ->with('subject')
            ->orderBy('title')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'title' => $m->title,
                'subject' => $m->subject?->name ?? 'N/A',
                'level' => $m->level_label,
                'enrolled' => $m->enrollments_count,
                'completed' => $m->completed_count,
                'inProgress' => $m->in_progress_count,
                'completionRate' => $m->enrollments_count > 0
                    ? round(($m->completed_count / $m->enrollments_count) * 100, 1)
                    : 0,
            ]);

        // Per-subject breakdown
        $subjectStats = Subject::orderBy('name')
            ->get()
            ->map(function ($subject) {
                $moduleIds = LearningModule::where('subject_id', $subject->id)->pluck('id');
                $enrolled = Enrollment::whereIn('module_id', $moduleIds)->count();
                $completed = Enrollment::whereIn('module_id', $moduleIds)->completed()->count();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'modules' => $moduleIds->count(),
                    'enrolled' => $enrolled,
                    'completed' => $completed,
                    'completionRate' => $enrolled > 0 ? round(($completed / $enrolled) * 100, 1) : 0,
                ];
            });

        // Top students by completed modules
        $topStudents = User::where('role', 'student')
            ->withCount([
                'enrollments as completed_count' => fn ($q) => $q->where('status', 'completed'),
                'enrollments as total_enrollments' => fn ($q) => $q->active(),
            ])
            ->having('completed_count', '>', 0)
            ->orderByDesc('completed_count')
            ->limit(10)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'completed' => $u->completed_count,
                'total' => $u->total_enrollments,
            ]);

        return Inertia::render('admin/reports/index', [
            'centerStats' => $centerStats,
            'moduleStats' => $moduleStats,
            'subjectStats' => $subjectStats,
            'topStudents' => $topStudents,
        ]);
    }
}
