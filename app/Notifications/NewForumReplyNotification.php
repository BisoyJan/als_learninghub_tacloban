<?php

namespace App\Notifications;

use App\Models\ForumReply;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewForumReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        public ForumReply $reply
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Reply: ' . $this->reply->thread->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->reply->user->name . ' replied to the thread "' . $this->reply->thread->title . '".')
            ->line(str()->limit(strip_tags($this->reply->body), 150))
            ->action('View Thread', url('/forum/' . $this->reply->thread->slug))
            ->line('Thank you for using ALS Connect Tacloban!');
    }

    /**
     * Get the array representation for database storage.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'forum_reply',
            'thread_id' => $this->reply->thread_id,
            'thread_title' => $this->reply->thread->title,
            'thread_slug' => $this->reply->thread->slug,
            'reply_by' => $this->reply->user->name,
            'message' => str()->limit(strip_tags($this->reply->body), 100),
        ];
    }
}
