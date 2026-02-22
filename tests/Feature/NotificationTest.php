<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Notifications\NewAnnouncementNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
    }

    public function test_guests_cannot_access_notifications()
    {
        $this->get(route('notifications.index'))->assertRedirect(route('login'));
    }

    public function test_user_can_view_notifications()
    {
        $response = $this->actingAs($this->student)->get(route('notifications.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications')
            ->has('unreadCount')
        );
    }

    public function test_user_can_get_unread_count()
    {
        // Create an announcement and notify the student
        $announcement = Announcement::create([
            'author_id' => User::factory()->create(['role' => 'admin'])->id,
            'title' => 'Test',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $this->student->notify(new NewAnnouncementNotification($announcement));

        $response = $this->actingAs($this->student)
            ->getJson(route('notifications.unread-count'));

        $response->assertOk();
        $response->assertJson(['count' => 1]);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $announcement = Announcement::create([
            'author_id' => User::factory()->create(['role' => 'admin'])->id,
            'title' => 'Test',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $this->student->notify(new NewAnnouncementNotification($announcement));
        $notification = $this->student->notifications()->first();

        $response = $this->actingAs($this->student)
            ->patchJson(route('notifications.read', $notification->id));

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Send 3 notifications
        for ($i = 0; $i < 3; $i++) {
            $announcement = Announcement::create([
                'author_id' => $admin->id,
                'title' => "Test {$i}",
                'body' => 'Content',
                'audience' => 'all',
                'published_at' => now(),
            ]);
            $this->student->notify(new NewAnnouncementNotification($announcement));
        }

        $this->assertEquals(3, $this->student->unreadNotifications()->count());

        $response = $this->actingAs($this->student)
            ->postJson(route('notifications.read-all'));

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $this->assertEquals(0, $this->student->fresh()->unreadNotifications()->count());
    }
}
