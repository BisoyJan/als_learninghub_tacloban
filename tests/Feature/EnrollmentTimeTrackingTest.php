<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentTimeTrackingTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student;
    private Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);

        $subject = Subject::create(['name' => 'History', 'slug' => 'history']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $this->teacher->id,
            'title' => 'Philippine History',
            'slug' => 'philippine-history',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $this->enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);
    }

    // ---------- logTime endpoint ----------

    public function test_student_can_log_time()
    {
        $response = $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 60,
            ]);

        $response->assertOk()->assertJson(['ok' => true]);
        $this->assertDatabaseHas('enrollments', [
            'id' => $this->enrollment->id,
            'time_spent_seconds' => 60,
        ]);
    }

    public function test_log_time_accumulates_seconds()
    {
        $this->enrollment->update(['time_spent_seconds' => 120]);

        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 60,
            ]);

        $this->assertDatabaseHas('enrollments', [
            'id' => $this->enrollment->id,
            'time_spent_seconds' => 180,
        ]);
    }

    public function test_log_time_updates_last_accessed_at()
    {
        $this->assertNull($this->enrollment->last_accessed_at);

        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 60,
            ]);

        $this->assertNotNull($this->enrollment->fresh()->last_accessed_at);
    }

    public function test_teacher_cannot_log_time()
    {
        $this->actingAs($this->teacher)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 60,
            ])
            ->assertForbidden();
    }

    public function test_guests_cannot_log_time()
    {
        $this->postJson(route('sessions.log-time'), [
            'enrollment_id' => $this->enrollment->id,
            'seconds' => 60,
        ])->assertUnauthorized();
    }

    public function test_student_cannot_log_time_for_other_students_enrollment()
    {
        $otherStudent = User::factory()->create(['role' => 'student']);
        $subject = Subject::create(['name' => 'Science', 'slug' => 'science-2']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $this->teacher->id,
            'title' => 'Physics',
            'slug' => 'physics',
            'level' => 'senior_high',
            'status' => 'published',
        ]);
        $otherEnrollment = Enrollment::create([
            'student_id' => $otherStudent->id,
            'module_id' => $module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);

        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $otherEnrollment->id,
                'seconds' => 60,
            ])
            ->assertNotFound();
    }

    public function test_log_time_validates_required_fields()
    {
        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['enrollment_id', 'seconds']);
    }

    public function test_log_time_rejects_zero_seconds()
    {
        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 0,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('seconds');
    }

    public function test_log_time_rejects_more_than_one_hour()
    {
        $this->actingAs($this->student)
            ->postJson(route('sessions.log-time'), [
                'enrollment_id' => $this->enrollment->id,
                'seconds' => 3601,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('seconds');
    }

    // ---------- time_spent_formatted accessor ----------

    public function test_time_spent_formatted_less_than_one_minute()
    {
        $this->enrollment->time_spent_seconds = 45;
        $this->assertEquals('< 1m', $this->enrollment->time_spent_formatted);
    }

    public function test_time_spent_formatted_minutes_only()
    {
        $this->enrollment->time_spent_seconds = 300; // 5 min
        $this->assertEquals('5m', $this->enrollment->time_spent_formatted);
    }

    public function test_time_spent_formatted_hours_and_minutes()
    {
        $this->enrollment->time_spent_seconds = 5400; // 1h 30m
        $this->assertEquals('1h 30m', $this->enrollment->time_spent_formatted);
    }

    public function test_time_spent_formatted_exact_hour()
    {
        $this->enrollment->time_spent_seconds = 3600; // 1h
        $this->assertEquals('1h 0m', $this->enrollment->time_spent_formatted);
    }

    public function test_time_spent_defaults_to_zero()
    {
        $fresh = Enrollment::find($this->enrollment->id);
        $this->assertEquals(0, $fresh->time_spent_seconds);
    }
}
