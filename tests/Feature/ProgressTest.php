<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgressTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);

        $subject = Subject::create(['name' => 'Science', 'slug' => 'science']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Biology',
            'slug' => 'biology',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $this->enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $module->id,
            'enrolled_by' => $teacher->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_guests_cannot_access_progress()
    {
        $this->get(route('progress.index'))->assertRedirect(route('login'));
    }

    public function test_teacher_cannot_access_student_progress_page()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($teacher)->get(route('progress.index'))->assertForbidden();
    }

    public function test_student_can_view_progress_overview()
    {
        $response = $this->actingAs($this->student)->get(route('progress.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('progress/index')
            ->has('enrollments')
            ->has('stats')
        );
    }

    public function test_student_can_view_enrollment_detail()
    {
        $response = $this->actingAs($this->student)
            ->get(route('progress.show', $this->enrollment));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('progress/show')
            ->has('enrollment')
        );
    }

    public function test_student_cannot_view_other_students_enrollment()
    {
        $otherStudent = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($otherStudent)
            ->get(route('progress.show', $this->enrollment));

        $response->assertForbidden();
    }

    public function test_progress_stats_are_correct()
    {
        // Add some progress records
        ProgressRecord::create([
            'enrollment_id' => $this->enrollment->id,
            'title' => 'Quiz 1',
            'type' => 'assessment',
            'score' => 90,
            'max_score' => 100,
            'recorded_by' => 1,
            'recorded_date' => now(),
        ]);

        $response = $this->actingAs($this->student)->get(route('progress.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('stats.totalEnrolled', 1)
            ->where('stats.inProgress', 1)
        );
    }
}
