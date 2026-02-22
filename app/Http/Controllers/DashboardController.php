<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Enrollment;
use App\Models\ForumThread;
use App\Models\LearningModule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the appropriate dashboard based on user role.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            'admin' => Inertia::render('dashboard/admin-dashboard', [
                'stats' => [
                    'totalUsers' => User::count(),
                    'teachers' => User::where('role', 'teacher')->count(),
                    'students' => User::where('role', 'student')->count(),
                    'activeUsers' => User::where('is_active', true)->count(),
                    'modules' => LearningModule::count(),
                    'publishedModules' => LearningModule::published()->count(),
                    'enrollments' => Enrollment::count(),
                    'completedEnrollments' => Enrollment::completed()->count(),
                    'announcements' => Announcement::count(),
                    'forumThreads' => ForumThread::count(),
                ],
            ]),
            'teacher' => Inertia::render('dashboard/teacher-dashboard', [
                'stats' => [
                    'modules' => LearningModule::published()->count(),
                    'myStudents' => Enrollment::where('enrolled_by', $user->id)->distinct('student_id')->count('student_id'),
                    'activeEnrollments' => Enrollment::where('enrolled_by', $user->id)->active()->count(),
                    'forumThreads' => ForumThread::where('user_id', $user->id)->count(),
                ],
            ]),
            default => Inertia::render('dashboard/student-dashboard', [
                'stats' => [
                    'modulesAvailable' => LearningModule::published()->count(),
                    'enrolled' => Enrollment::where('student_id', $user->id)->active()->count(),
                    'completed' => Enrollment::where('student_id', $user->id)->completed()->count(),
                    'announcements' => Announcement::published()->forAudience($user->role)->count(),
                ],
            ]),
        };
    }
}
