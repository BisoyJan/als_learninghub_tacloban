<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * Inbox: messages received by the authenticated user.
     * Teachers/admins also see sent messages tab data.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $inbox = Message::inbox($user->id)
            ->with('sender:id,name,role')
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'inbox_page')
            ->withQueryString();

        $sent = Message::sent($user->id)
            ->with('recipient:id,name,role')
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'sent_page')
            ->withQueryString();

        // Potential recipients: teachers/admins for students; students for teachers/admins
        $recipientsQuery = User::where('is_active', true)->where('id', '!=', $user->id);
        if ($user->isStudent()) {
            $recipientsQuery->whereIn('role', ['teacher', 'admin']);
        } else {
            $recipientsQuery->where('role', 'student');
        }
        $recipients = $recipientsQuery->orderBy('name')->get(['id', 'name', 'role']);

        $unreadCount = Message::inbox($user->id)->unread()->count();

        return Inertia::render('messages/index', [
            'inbox' => $inbox,
            'sent' => $sent,
            'recipients' => $recipients,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Send a message.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_id' => ['required', 'exists:users,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        // Prevent self-messaging
        if ((int) $validated['recipient_id'] === $request->user()->id) {
            return back()->withErrors(['recipient_id' => 'You cannot send a message to yourself.']);
        }

        Message::create([
            ...$validated,
            'sender_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Message sent.');
    }

    /**
     * Mark a message as read.
     */
    public function markRead(Message $message, Request $request): RedirectResponse
    {
        if ($message->recipient_id !== $request->user()->id) {
            abort(403);
        }

        if (! $message->isRead()) {
            $message->update(['read_at' => now()]);
        }

        return back();
    }

    /**
     * Delete a message (only sender or recipient).
     */
    public function destroy(Message $message, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($message->sender_id !== $user->id && $message->recipient_id !== $user->id) {
            abort(403);
        }

        $message->delete();

        return back()->with('success', 'Message deleted.');
    }
}
