<?php

namespace Tests\Unit;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementModelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_published_scope_filters_unpublished()
    {
        Announcement::create(['author_id' => $this->admin->id, 'title' => 'Published', 'body' => 'x', 'audience' => 'all', 'published_at' => now()]);
        Announcement::create(['author_id' => $this->admin->id, 'title' => 'Draft', 'body' => 'x', 'audience' => 'all', 'published_at' => null]);

        $this->assertEquals(1, Announcement::published()->count());
    }

    public function test_for_audience_scope_filters_correctly()
    {
        Announcement::create(['author_id' => $this->admin->id, 'title' => 'All', 'body' => 'x', 'audience' => 'all', 'published_at' => now()]);
        Announcement::create(['author_id' => $this->admin->id, 'title' => 'Students', 'body' => 'x', 'audience' => 'students', 'published_at' => now()]);
        Announcement::create(['author_id' => $this->admin->id, 'title' => 'Teachers', 'body' => 'x', 'audience' => 'teachers', 'published_at' => now()]);

        // Student sees 'all' + 'students' = 2
        $this->assertEquals(2, Announcement::forAudience('student')->count());
        // Teacher sees 'all' + 'teachers' = 2
        $this->assertEquals(2, Announcement::forAudience('teacher')->count());
        // Admin sees 'all' + 'admins' = 1 (no 'admins' audience in this test)
        $this->assertEquals(1, Announcement::forAudience('admin')->count());
    }

    public function test_audience_label_attribute()
    {
        $announcement = new Announcement(['audience' => 'students']);
        $this->assertEquals('Students Only', $announcement->audience_label);

        $announcement->audience = 'all';
        $this->assertEquals('Everyone', $announcement->audience_label);
    }

    public function test_author_relationship()
    {
        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Test',
            'body' => 'Content',
            'audience' => 'all',
            'published_at' => now(),
        ]);

        $this->assertEquals($this->admin->id, $announcement->author->id);
    }

    public function test_is_pinned_casts_to_boolean()
    {
        $announcement = Announcement::create([
            'author_id' => $this->admin->id,
            'title' => 'Pinned',
            'body' => 'x',
            'audience' => 'all',
            'is_pinned' => true,
            'published_at' => now(),
        ]);

        $this->assertTrue($announcement->is_pinned);
        $this->assertIsBool($announcement->is_pinned);
    }
}
