<?php

namespace Tests\Feature;

use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use App\Models\User;
use App\Notifications\NewForumReplyNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ForumTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $teacher;
    private User $student;
    private ForumCategory $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->category = ForumCategory::create([
            'name' => 'General',
            'slug' => 'general',
            'color' => '#3b82f6',
            'sort_order' => 0,
        ]);
    }

    // ---------- Index ----------

    public function test_guests_cannot_access_forum()
    {
        $this->get(route('forum.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_forum()
    {
        $response = $this->actingAs($this->student)->get(route('forum.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('forum/index')
            ->has('categories')
            ->has('threads')
        );
    }

    public function test_forum_can_filter_by_category()
    {
        $otherCategory = ForumCategory::create([
            'name' => 'Help',
            'slug' => 'help',
            'color' => '#ef4444',
            'sort_order' => 1,
        ]);

        ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'General Thread',
            'body' => 'Content',
        ]);

        ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $otherCategory->id,
            'title' => 'Help Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('forum.index', ['category' => 'general']));

        $response->assertInertia(fn ($page) => $page->has('threads.data', 1));
    }

    public function test_forum_can_search_threads()
    {
        ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'How to study algebra',
            'body' => 'I need help',
        ]);

        ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Science question',
            'body' => 'About biology',
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('forum.index', ['search' => 'algebra']));

        $response->assertInertia(fn ($page) => $page->has('threads.data', 1));
    }

    // ---------- Create Thread ----------

    public function test_user_can_view_create_thread_form()
    {
        $response = $this->actingAs($this->student)->get(route('forum.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('forum/create')
            ->has('categories')
        );
    }

    public function test_user_can_create_thread()
    {
        $response = $this->actingAs($this->student)->post(route('forum.store'), [
            'title' => 'My First Question',
            'body' => 'I need help with math.',
            'category_id' => $this->category->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('forum_threads', [
            'user_id' => $this->student->id,
            'title' => 'My First Question',
            'category_id' => $this->category->id,
        ]);
    }

    public function test_create_thread_validates_required_fields()
    {
        $response = $this->actingAs($this->student)->post(route('forum.store'), []);
        $response->assertSessionHasErrors(['title', 'body', 'category_id']);
    }

    // ---------- Show Thread ----------

    public function test_user_can_view_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Test Thread',
            'body' => 'Thread content',
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('forum.show', $thread));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('forum/show')
            ->has('thread')
        );
    }

    // ---------- Replies ----------

    public function test_user_can_reply_to_thread()
    {
        Notification::fake();

        $thread = ForumThread::create([
            'user_id' => $this->teacher->id,
            'category_id' => $this->category->id,
            'title' => 'Teacher Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->student)
            ->post(route('forum.reply', $thread), ['body' => 'My reply']);

        $response->assertRedirect();
        $this->assertDatabaseHas('forum_replies', [
            'thread_id' => $thread->id,
            'user_id' => $this->student->id,
            'body' => 'My reply',
        ]);
    }

    public function test_reply_notifies_thread_author()
    {
        Notification::fake();

        $thread = ForumThread::create([
            'user_id' => $this->teacher->id,
            'category_id' => $this->category->id,
            'title' => 'Teacher Thread',
            'body' => 'Content',
        ]);

        $this->actingAs($this->student)
            ->post(route('forum.reply', $thread), ['body' => 'Reply notification test']);

        Notification::assertSentTo($this->teacher, NewForumReplyNotification::class);
    }

    public function test_self_reply_does_not_notify()
    {
        Notification::fake();

        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'My Thread',
            'body' => 'Content',
        ]);

        $this->actingAs($this->student)
            ->post(route('forum.reply', $thread), ['body' => 'My own reply']);

        Notification::assertNotSentTo($this->student, NewForumReplyNotification::class);
    }

    public function test_cannot_reply_to_locked_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->teacher->id,
            'category_id' => $this->category->id,
            'title' => 'Locked Thread',
            'body' => 'Content',
            'is_locked' => true,
        ]);

        $response = $this->actingAs($this->student)
            ->post(route('forum.reply', $thread), ['body' => 'Trying to reply']);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseCount('forum_replies', 0);
    }

    // ---------- Delete ----------

    public function test_thread_author_can_delete_own_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'My Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->student)
            ->delete(route('forum.threads.destroy', $thread));

        $response->assertRedirect('/forum');
        $this->assertDatabaseMissing('forum_threads', ['id' => $thread->id]);
    }

    public function test_user_cannot_delete_others_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->teacher->id,
            'category_id' => $this->category->id,
            'title' => 'Teacher Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->student)
            ->delete(route('forum.threads.destroy', $thread));

        $response->assertForbidden();
    }

    public function test_admin_can_delete_any_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Student Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('forum.threads.destroy', $thread));

        $response->assertRedirect('/forum');
        $this->assertDatabaseMissing('forum_threads', ['id' => $thread->id]);
    }

    public function test_reply_author_can_delete_own_reply()
    {
        $thread = ForumThread::create([
            'user_id' => $this->teacher->id,
            'category_id' => $this->category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        $reply = ForumReply::create([
            'thread_id' => $thread->id,
            'user_id' => $this->student->id,
            'body' => 'My reply',
        ]);

        $response = $this->actingAs($this->student)
            ->delete(route('forum.replies.destroy', $reply));

        $response->assertRedirect();
        $this->assertDatabaseMissing('forum_replies', ['id' => $reply->id]);
    }

    // ---------- Admin Moderation ----------

    public function test_admin_can_toggle_thread_lock()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Thread to Lock',
            'body' => 'Content',
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('forum.threads.lock', $thread));

        $response->assertRedirect();
        $this->assertTrue($thread->fresh()->is_locked);
    }

    public function test_admin_can_toggle_thread_pin()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Thread to Pin',
            'body' => 'Content',
            'is_pinned' => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('forum.threads.pin', $thread));

        $response->assertRedirect();
        $this->assertTrue($thread->fresh()->is_pinned);
    }

    public function test_non_admin_cannot_lock_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->teacher)
            ->patch(route('forum.threads.lock', $thread));

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_pin_thread()
    {
        $thread = ForumThread::create([
            'user_id' => $this->student->id,
            'category_id' => $this->category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        $response = $this->actingAs($this->teacher)
            ->patch(route('forum.threads.pin', $thread));

        $response->assertForbidden();
    }
}
