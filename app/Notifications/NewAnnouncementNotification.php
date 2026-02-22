<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAnnouncementNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Announcement $announcement
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
            ->subject('New Announcement: ' . $this->announcement->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A new announcement has been posted on ALS Connect Tacloban.')
            ->line('**' . $this->announcement->title . '**')
            ->line(str()->limit(strip_tags($this->announcement->body), 150))
            ->action('View Announcement', url('/announcements/' . $this->announcement->id))
            ->line('Thank you for using ALS Connect Tacloban!');
    }

    /**
     * Get the array representation for database storage.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'announcement',
            'announcement_id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'message' => str()->limit(strip_tags($this->announcement->body), 100),
            'author' => $this->announcement->author->name,
        ];
    }
}
