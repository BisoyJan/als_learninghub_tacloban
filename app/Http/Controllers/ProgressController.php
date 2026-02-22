<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    /**
     * Student progress overview: all their enrollments with progress.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $enrollments = Enrollment::with(['module.subject', 'progressRecords'])
            ->where('student_id', $user->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        // Compute stats
        $totalEnrolled = $enrollments->count();
        $completed = $enrollments->where('status', 'completed')->count();
        $inProgress = $enrollments->where('status', 'in_progress')->count();

        $averageScore = null;
        $allScores = $enrollments->flatMap(function ($enrollment) {
            return $enrollment->progressRecords->whereNotNull('score')->pluck('score');
        });
        if ($allScores->count() > 0) {
            $averageScore = round($allScores->avg(), 1);
        }

        // Get user's badges
        $badges = UserBadge::where('user_id', $user->id)
            ->with('badge')
            ->orderBy('earned_at', 'desc')
            ->get()
            ->map(fn ($ub) => [
                'id' => $ub->badge->id,
                'name' => $ub->badge->name,
                'description' => $ub->badge->description,
                'icon' => $ub->badge->icon,
                'color' => $ub->badge->color,
                'earned_at' => $ub->earned_at->toISOString(),
            ]);

        return Inertia::render('progress/index', [
            'enrollments' => $enrollments,
            'stats' => [
                'totalEnrolled' => $totalEnrolled,
                'completed' => $completed,
                'inProgress' => $inProgress,
                'averageScore' => $averageScore,
            ],
            'badges' => $badges,
        ]);
    }

    /**
     * Student view of a specific enrollment's progress details.
     */
    public function show(Enrollment $enrollment, Request $request): Response
    {
        $user = $request->user();

        // Students can only view their own enrollments
        if ($enrollment->student_id !== $user->id) {
            abort(403);
        }

        $enrollment->load([
            'module.subject',
            'module.resources',
            'progressRecords.recordedBy',
        ]);

        return Inertia::render('progress/show', [
            'enrollment' => $enrollment,
        ]);
    }
}
