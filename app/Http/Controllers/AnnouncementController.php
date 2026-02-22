<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use App\Notifications\NewAnnouncementNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display announcements for the current user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $announcements = Announcement::published()
            ->forAudience($user->role)
            ->ordered()
            ->with('author:id,name,role')
            ->paginate(10);

        return Inertia::render('announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Show a single announcement.
     */
    public function show(Announcement $announcement): Response
    {
        $announcement->load('author:id,name,role');

        return Inertia::render('announcements/show', [
            'announcement' => $announcement,
        ]);
    }

    /**
     * Show management page for admins/teachers to create & manage announcements.
     */
    public function manage(Request $request): Response
    {
        $announcements = Announcement::ordered()
            ->with('author:id,name,role')
            ->when($request->user()->isTeacher(), function ($q) use ($request) {
                $q->where('author_id', $request->user()->id);
            })
            ->paginate(15);

        return Inertia::render('announcements/manage', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Store a new announcement.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'audience' => 'required|in:all,students,teachers,admins',
            'is_pinned' => 'boolean',
            'publish_now' => 'boolean',
        ]);

        $announcement = Announcement::create([
            'author_id' => $request->user()->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
            'audience' => $validated['audience'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'published_at' => ($validated['publish_now'] ?? true) ? now() : null,
        ]);

        // Send notifications to target audience if published
        if ($announcement->published_at) {
            $this->notifyAudience($announcement);
        }

        return redirect()->back()->with('success', 'Announcement created successfully.');
    }

    /**
     * Update an announcement.
     */
    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'audience' => 'required|in:all,students,teachers,admins',
            'is_pinned' => 'boolean',
        ]);

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Announcement updated successfully.');
    }

    /**
     * Publish a draft announcement.
     */
    public function publish(Announcement $announcement): RedirectResponse
    {
        $announcement->update(['published_at' => now()]);
        $this->notifyAudience($announcement);

        return redirect()->back()->with('success', 'Announcement published successfully.');
    }

    /**
     * Delete an announcement.
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully.');
    }

    /**
     * Send notifications to the target audience.
     */
    private function notifyAudience(Announcement $announcement): void
    {
        $query = User::where('is_active', true);

        if ($announcement->audience !== 'all') {
            // 'students' → 'student', 'teachers' → 'teacher', 'admins' → 'admin'
            $role = rtrim($announcement->audience, 's');
            $query->where('role', $role);
        }

        $users = $query->get();
        Notification::send($users, new NewAnnouncementNotification($announcement));
    }
}
