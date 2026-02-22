<?php

namespace Tests\Unit;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\Subject;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentModelTest extends TestCase
{
    use RefreshDatabase;

    private function createEnrollment(): Enrollment
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $subject = Subject::create(['name' => 'Math', 'slug' => 'math']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Test Module',
            'slug' => 'test-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        return Enrollment::create([
            'student_id' => $student->id,
            'module_id' => $module->id,
            'enrolled_by' => $teacher->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_status_label_attribute()
    {
        $enrollment = $this->createEnrollment();

        $this->assertEquals('Enrolled', $enrollment->status_label);

        $enrollment->status = 'in_progress';
        $this->assertEquals('In Progress', $enrollment->status_label);

        $enrollment->status = 'completed';
        $this->assertEquals('Completed', $enrollment->status_label);
    }

    public function test_average_score_attribute()
    {
        $enrollment = $this->createEnrollment();
        $teacher = User::where('role', 'teacher')->first();

        ProgressRecord::create([
            'enrollment_id' => $enrollment->id,
            'title' => 'Quiz 1',
            'type' => 'assessment',
            'score' => 80,
            'max_score' => 100,
            'recorded_by' => $teacher->id,
            'recorded_date' => now(),
        ]);

        ProgressRecord::create([
            'enrollment_id' => $enrollment->id,
            'title' => 'Quiz 2',
            'type' => 'assessment',
            'score' => 90,
            'max_score' => 100,
            'recorded_by' => $teacher->id,
            'recorded_date' => now(),
        ]);

        $this->assertEquals(85.0, $enrollment->fresh()->average_score);
    }

    public function test_average_score_returns_null_when_no_scores()
    {
        $enrollment = $this->createEnrollment();
        $this->assertNull($enrollment->average_score);
    }

    public function test_completed_scope()
    {
        $enrollment = $this->createEnrollment();
        $enrollment->update(['status' => 'completed']);

        $this->assertEquals(1, Enrollment::completed()->count());
    }

    public function test_active_scope()
    {
        $enrollment = $this->createEnrollment();
        $this->assertEquals(1, Enrollment::active()->count());

        $enrollment->update(['status' => 'dropped']);
        $this->assertEquals(0, Enrollment::active()->count());
    }

    public function test_relationships()
    {
        $enrollment = $this->createEnrollment();

        $this->assertInstanceOf(User::class, $enrollment->student);
        $this->assertInstanceOf(LearningModule::class, $enrollment->module);
        $this->assertInstanceOf(User::class, $enrollment->enrolledBy);
    }
}
