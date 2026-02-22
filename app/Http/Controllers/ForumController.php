<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use App\Notifications\NewForumReplyNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForumController extends Controller
{
    /**
     * Display the forum index — categories and recent threads.
     */
    public function index(Request $request): Response
    {
        $categories = ForumCategory::ordered()
            ->withCount('threads')
            ->get();

        $threads = ForumThread::ordered()
            ->with(['user:id,name,role', 'category:id,name,slug,color'])
            ->withCount('replies')
            ->when($request->query('category'), function ($q, $categorySlug) {
                $q->whereHas('category', fn ($sub) => $sub->where('slug', $categorySlug));
            })
            ->when($request->query('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                });
            })
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('forum/index', [
            'categories' => $categories,
            'threads' => $threads,
            'filters' => [
                'category' => $request->query('category', ''),
                'search' => $request->query('search', ''),
            ],
        ]);
    }

    /**
     * Show a single thread with replies.
     */
    public function show(ForumThread $thread): Response
    {
        $thread->load([
            'user:id,name,role',
            'category:id,name,slug,color',
            'replies' => fn ($q) => $q->with('user:id,name,role')->orderBy('created_at'),
        ]);

        return Inertia::render('forum/show', [
            'thread' => $thread,
        ]);
    }

    /**
     * Show the create thread form.
     */
    public function create(): Response
    {
        $categories = ForumCategory::ordered()->get(['id', 'name', 'slug']);

        return Inertia::render('forum/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new thread.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'category_id' => 'required|exists:forum_categories,id',
        ]);

        $thread = ForumThread::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return redirect('/forum/' . $thread->slug)->with('success', 'Thread created successfully.');
    }

    /**
     * Store a reply to a thread.
     */
    public function reply(Request $request, ForumThread $thread): RedirectResponse
    {
        if ($thread->is_locked) {
            return redirect()->back()->with('error', 'This thread is locked.');
        }

        $validated = $request->validate([
            'body' => 'required|string',
        ]);

        $reply = ForumReply::create([
            'thread_id' => $thread->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        // Notify the thread author (if not the same user)
        if ($thread->user_id !== $request->user()->id) {
            $reply->load(['thread', 'user']);
            $thread->user->notify(new NewForumReplyNotification($reply));
        }

        return redirect()->back()->with('success', 'Reply posted successfully.');
    }

    /**
     * Delete a thread (author or admin only).
     */
    public function destroyThread(Request $request, ForumThread $thread): RedirectResponse
    {
        $user = $request->user();

        if ($user->id !== $thread->user_id && !$user->isAdmin()) {
            abort(403);
        }

        $thread->delete();

        return redirect('/forum')->with('success', 'Thread deleted successfully.');
    }

    /**
     * Delete a reply (author or admin only).
     */
    public function destroyReply(Request $request, ForumReply $reply): RedirectResponse
    {
        $user = $request->user();

        if ($user->id !== $reply->user_id && !$user->isAdmin()) {
            abort(403);
        }

        $reply->delete();

        return redirect()->back()->with('success', 'Reply deleted successfully.');
    }

    /**
     * Toggle thread lock (admin only).
     */
    public function toggleLock(ForumThread $thread): RedirectResponse
    {
        $thread->update(['is_locked' => !$thread->is_locked]);

        return redirect()->back()->with('success', $thread->is_locked ? 'Thread locked.' : 'Thread unlocked.');
    }

    /**
     * Toggle thread pin (admin only).
     */
    public function togglePin(ForumThread $thread): RedirectResponse
    {
        $thread->update(['is_pinned' => !$thread->is_pinned]);

        return redirect()->back()->with('success', $thread->is_pinned ? 'Thread pinned.' : 'Thread unpinned.');
    }
}
