<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Enrollment;
use App\Models\ForumThread;
use App\Models\LearningModule;
use App\Models\LearningSession;
use App\Models\Message;
use App\Models\SessionAttendance;
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
                'recentMessages' => Message::inbox($user->id)
                    ->with('sender:id,name,role')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'sender' => $m->sender->name,
                        'sender_role' => $m->sender->role,
                        'subject' => $m->subject,
                        'preview' => str()->limit(strip_tags($m->body), 80),
                        'read' => $m->isRead(),
                        'created_at' => $m->created_at->diffForHumans(),
                    ]),
                'upcomingSessions' => LearningSession::with('module:id,title')
                    ->where('scheduled_at', '>=', now())
                    ->where('status', 'upcoming')
                    ->orderBy('scheduled_at')
                    ->take(5)
                    ->get()
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'title' => $s->title,
                        'module' => $s->module?->title,
                        'scheduled_at' => $s->scheduled_at->toISOString(),
                        'mode_label' => $s->mode_label,
                    ]),
            ]),
            'teacher' => Inertia::render('dashboard/teacher-dashboard', [
                'stats' => [
                    'modules' => LearningModule::published()->count(),
                    'myStudents' => Enrollment::where('enrolled_by', $user->id)->distinct('student_id')->count('student_id'),
                    'activeEnrollments' => Enrollment::where('enrolled_by', $user->id)->active()->count(),
                    'forumThreads' => ForumThread::where('user_id', $user->id)->count(),
                ],
                'recentMessages' => Message::inbox($user->id)
                    ->with('sender:id,name,role')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'sender' => $m->sender->name,
                        'sender_role' => $m->sender->role,
                        'subject' => $m->subject,
                        'preview' => str()->limit(strip_tags($m->body), 80),
                        'read' => $m->isRead(),
                        'created_at' => $m->created_at->diffForHumans(),
                    ]),
                'upcomingSessions' => LearningSession::with('module:id,title')
                    ->where('teacher_id', $user->id)
                    ->where('scheduled_at', '>=', now())
                    ->where('status', 'upcoming')
                    ->orderBy('scheduled_at')
                    ->take(5)
                    ->get()
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'title' => $s->title,
                        'module' => $s->module?->title,
                        'scheduled_at' => $s->scheduled_at->toISOString(),
                        'mode_label' => $s->mode_label,
                    ]),
            ]),
            default => Inertia::render('dashboard/student-dashboard', [
                'stats' => [
                    'modulesAvailable' => LearningModule::published()->count(),
                    'enrolled' => Enrollment::where('student_id', $user->id)->active()->count(),
                    'completed' => Enrollment::where('student_id', $user->id)->completed()->count(),
                    'announcements' => Announcement::published()->forAudience($user->role)->count(),
                ],
                'upcomingSessions' => SessionAttendance::where('student_id', $user->id)
                    ->join('learning_sessions', 'learning_sessions.id', '=', 'session_attendances.session_id')
                    ->where('learning_sessions.scheduled_at', '>=', now())
                    ->where('learning_sessions.status', 'upcoming')
                    ->orderBy('learning_sessions.scheduled_at')
                    ->take(5)
                    ->with('session.module:id,title')
                    ->get()
                    ->pluck('session')
                    ->filter()
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'title' => $s->title,
                        'module' => $s->module?->title,
                        'scheduled_at' => $s->scheduled_at->toISOString(),
                        'mode_label' => $s->mode_label,
                    ]),
            ]),
        };
    }
}
