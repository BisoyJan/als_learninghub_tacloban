<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Notifications\NewAnnouncementNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $teacher;
    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    // ---------- Public Access ----------

    public function test_guests_cannot_view_announcements()
    {
        $this->get(route('announcements.index'))->assertRedirect(route('login'));
    }

    public function test_student_can_view_announcements()
    {
        $response = $this->actingAs($this->student)->get(route('announcements.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('announcements/index')
            ->has('announcements')
        );
    }

    public function test_announcements_are_audience_filtered()
    {
        // Create announcements for different audiences
        Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'For Everyone',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'For Students Only',
            'body' => 'Content',
            'audience' => 'students',
            'published_at' => now(),
        ]);

        Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'For Teachers Only',
            'body' => 'Content',
            'audience' => 'teachers',
            'published_at' => now(),
        ]);

        // Student should see "all" + "students" = 2
        $response = $this->actingAs($this->student)->get(route('announcements.index'));
        $response->assertInertia(fn ($page) => $page->has('announcements.data', 2));

        // Teacher should see "all" + "teachers" = 2
        $response = $this->actingAs($this->teacher)->get(route('announcements.index'));
        $response->assertInertia(fn ($page) => $page->has('announcements.data', 2));
    }

    public function test_draft_announcements_not_shown_in_public_listing()
    {
        Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Draft',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => null,
        ]);

        $response = $this->actingAs($this->student)->get(route('announcements.index'));
        $response->assertInertia(fn ($page) => $page->has('announcements.data', 0));
    }

    public function test_user_can_view_single_announcement()
    {
        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Test Announcement',
            'body' => 'Announcement body content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->student)->get(route('announcements.show', $announcement));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('announcements/show'));
    }

    // ---------- Management ----------

    public function test_student_cannot_access_announcement_management()
    {
        $this->actingAs($this->student)->get(route('announcements.manage'))->assertForbidden();
    }

    public function test_teacher_can_access_announcement_management()
    {
        $response = $this->actingAs($this->teacher)->get(route('announcements.manage'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('announcements/manage'));
    }

    public function test_admin_can_create_announcement()
    {
        Notification::fake();

        $response = $this->actingAs($this->admin)->post(route('announcements.store'), [
            'title' => 'New Announcement',
            'body' => 'Announcement body',
            'audience' => 'all',
            'is_pinned' => false,
            'publish_now' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'title' => 'New Announcement',
            'audience' => 'all',
        ]);
    }

    public function test_creating_published_announcement_sends_notifications()
    {
        Notification::fake();

        $this->actingAs($this->admin)->post(route('announcements.store'), [
            'title' => 'Notify All',
            'body' => 'Content',
            'audience' => 'all',
            'publish_now' => true,
        ]);

        // All active users should be notified
        Notification::assertSentTo(
            [$this->admin, $this->teacher, $this->student],
            NewAnnouncementNotification::class
        );
    }

    public function test_creating_draft_does_not_send_notifications()
    {
        Notification::fake();

        $this->actingAs($this->admin)->post(route('announcements.store'), [
            'title' => 'Draft',
            'body' => 'Content',
            'audience' => 'all',
            'publish_now' => false,
        ]);

        Notification::assertNothingSent();
    }

    public function test_admin_can_update_announcement()
    {
        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Original',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->put(route('announcements.update', $announcement), [
            'title' => 'Updated Title',
            'body' => 'Updated body',
            'audience' => 'students',
            'is_pinned' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'title' => 'Updated Title',
            'audience' => 'students',
        ]);
    }

    public function test_admin_can_publish_draft()
    {
        Notification::fake();

        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Draft to Publish',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => null,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('announcements.publish', $announcement));

        $response->assertRedirect();
        $announcement->refresh();
        $this->assertNotNull($announcement->published_at);
    }

    public function test_admin_can_delete_announcement()
    {
        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'To Delete',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('announcements.destroy', $announcement));

        $response->assertRedirect();
        $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
    }

    public function test_store_validates_required_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('announcements.store'), []);
        $response->assertSessionHasErrors(['title', 'body', 'audience']);
    }
}
