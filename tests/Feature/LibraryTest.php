<?php

namespace Tests\Feature;

use App\Models\LearningModule;
use App\Models\LearningResource;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LibraryTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
        $this->subject = Subject::create(['name' => 'English', 'slug' => 'english']);
    }

    public function test_guests_cannot_access_library()
    {
        $this->get(route('library.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_library()
    {
        $response = $this->actingAs($this->student)->get(route('library.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('library/index')
            ->has('modules')
            ->has('subjects')
        );
    }

    public function test_library_shows_only_published_modules()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Published Module',
            'slug' => 'published-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Draft Module',
            'slug' => 'draft-module',
            'level' => 'elementary',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->student)->get(route('library.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('modules.data', 1)
        );
    }

    public function test_library_can_filter_by_subject()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otherSubject = Subject::create(['name' => 'Science', 'slug' => 'science']);

        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'English Module',
            'slug' => 'english-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        LearningModule::create([
            'subject_id' => $otherSubject->id,
            'created_by' => $admin->id,
            'title' => 'Science Module',
            'slug' => 'science-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('library.index', ['subject' => $this->subject->id]));

        $response->assertInertia(fn ($page) => $page
            ->has('modules.data', 1)
        );
    }

    public function test_library_can_search_modules()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Basic Grammar',
            'slug' => 'basic-grammar',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Advanced Vocabulary',
            'slug' => 'advanced-vocabulary',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('library.index', ['search' => 'Grammar']));

        $response->assertInertia(fn ($page) => $page
            ->has('modules.data', 1)
        );
    }

    public function test_student_can_view_published_module()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Viewable Module',
            'slug' => 'viewable-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->student)->get(route('library.show', $module));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('library/show')
            ->has('module')
        );
    }

    public function test_student_cannot_view_draft_module()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $admin->id,
            'title' => 'Draft Module',
            'slug' => 'draft-module',
            'level' => 'elementary',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->student)->get(route('library.show', $module));

        $response->assertForbidden();
    }
}
