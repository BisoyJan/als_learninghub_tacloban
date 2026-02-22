<?php

namespace Tests\Unit;

use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForumModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_forum_category_auto_generates_slug()
    {
        $category = ForumCategory::create(['name' => 'Help & Questions', 'sort_order' => 0]);

        $this->assertEquals('help-questions', $category->slug);
    }

    public function test_forum_thread_auto_generates_slug()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);

        $thread = ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'My First Question',
            'body' => 'Content',
        ]);

        $this->assertNotEmpty($thread->slug);
        $this->assertStringStartsWith('my-first-question-', $thread->slug);
    }

    public function test_thread_reply_count_attribute()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);

        $thread = ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        ForumReply::create(['thread_id' => $thread->id, 'user_id' => $user->id, 'body' => 'Reply 1']);
        ForumReply::create(['thread_id' => $thread->id, 'user_id' => $user->id, 'body' => 'Reply 2']);

        $this->assertEquals(2, $thread->fresh()->reply_count);
    }

    public function test_thread_relationships()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);

        $thread = ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        $this->assertEquals($user->id, $thread->user->id);
        $this->assertEquals($category->id, $thread->category->id);
    }

    public function test_reply_relationships()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);
        $thread = ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Thread',
            'body' => 'Content',
        ]);

        $reply = ForumReply::create([
            'thread_id' => $thread->id,
            'user_id' => $user->id,
            'body' => 'Reply',
        ]);

        $this->assertEquals($user->id, $reply->user->id);
        $this->assertEquals($thread->id, $reply->thread->id);
    }

    public function test_thread_boolean_casts()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);

        $thread = ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Thread',
            'body' => 'Content',
            'is_pinned' => true,
            'is_locked' => false,
        ]);

        $this->assertIsBool($thread->is_pinned);
        $this->assertIsBool($thread->is_locked);
        $this->assertTrue($thread->is_pinned);
        $this->assertFalse($thread->is_locked);
    }

    public function test_ordered_scope_pins_first()
    {
        $user = User::factory()->create();
        $category = ForumCategory::create(['name' => 'General', 'slug' => 'general', 'sort_order' => 0]);

        ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Normal',
            'body' => 'Content',
            'is_pinned' => false,
        ]);

        ForumThread::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'title' => 'Pinned',
            'body' => 'Content',
            'is_pinned' => true,
        ]);

        $threads = ForumThread::ordered()->get();
        $this->assertEquals('Pinned', $threads->first()->title);
    }
}
