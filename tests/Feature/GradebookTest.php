<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradebookTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $student;
    private LearningModule $module;

    protected function setUp(): void
    {
        parent::setUp();
        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);

        $subject = Subject::create(['name' => 'Math', 'slug' => 'math']);
        $this->module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $this->teacher->id,
            'title' => 'Algebra Basics',
            'slug' => 'algebra-basics',
            'level' => 'junior_high',
            'status' => 'published',
        ]);
    }

    // ---------- Authorization ----------

    public function test_students_cannot_access_gradebook()
    {
        $this->actingAs($this->student)->get(route('gradebook.index'))->assertForbidden();
    }

    public function test_teacher_can_access_gradebook()
    {
        $response = $this->actingAs($this->teacher)->get(route('gradebook.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('gradebook/index'));
    }

    // ---------- Enrollment ----------

    public function test_teacher_can_enroll_student()
    {
        $response = $this->actingAs($this->teacher)->post(route('gradebook.enroll'), [
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_cannot_enroll_student_twice_in_same_module()
    {
        Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);

        $response = $this->actingAs($this->teacher)->post(route('gradebook.enroll'), [
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    // ---------- Progress Records ----------

    public function test_teacher_can_add_progress_record()
    {
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);

        $response = $this->actingAs($this->teacher)->post(route('gradebook.records.store', $enrollment), [
            'title' => 'Quiz 1',
            'type' => 'assessment',
            'score' => 85,
            'max_score' => 100,
            'recorded_date' => now()->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('progress_records', [
            'enrollment_id' => $enrollment->id,
            'title' => 'Quiz 1',
            'score' => 85,
        ]);

        // Status should auto-update to in_progress
        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_teacher_can_delete_progress_record()
    {
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'in_progress',
        ]);

        $record = ProgressRecord::create([
            'enrollment_id' => $enrollment->id,
            'title' => 'To Delete',
            'type' => 'activity',
            'recorded_by' => $this->teacher->id,
            'recorded_date' => now(),
        ]);

        $response = $this->actingAs($this->teacher)
            ->delete(route('gradebook.records.destroy', [$enrollment, $record]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('progress_records', ['id' => $record->id]);
    }

    // ---------- Status Update ----------

    public function test_teacher_can_mark_enrollment_completed()
    {
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($this->teacher)
            ->patch(route('gradebook.status', $enrollment), ['status' => 'completed']);

        $response->assertRedirect();
        $enrollment->refresh();
        $this->assertEquals('completed', $enrollment->status);
        $this->assertNotNull($enrollment->completed_at);
    }

    // ---------- Authorization for other teacher's enrollments ----------

    public function test_teacher_cannot_view_other_teachers_enrollment()
    {
        $otherTeacher = User::factory()->create(['role' => 'teacher']);
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $otherTeacher->id,
            'status' => 'enrolled',
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('gradebook.show', $enrollment));

        $response->assertForbidden();
    }
}
