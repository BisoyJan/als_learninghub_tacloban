<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\Subject;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_view_own_progress_report()
    {
        $student = User::factory()->create(['role' => 'student']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject = Subject::create(['name' => 'Math', 'slug' => 'math']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Algebra',
            'slug' => 'algebra',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'module_id' => $module->id,
            'enrolled_by' => $teacher->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($student)
            ->get(route('reports.progress', $enrollment));

        $response->assertOk();
        $response->assertSee('ALS Connect Tacloban');
        $response->assertSee($student->name);
    }

    public function test_student_cannot_view_other_students_report()
    {
        $student1 = User::factory()->create(['role' => 'student']);
        $student2 = User::factory()->create(['role' => 'student']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject = Subject::create(['name' => 'English', 'slug' => 'english']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Grammar',
            'slug' => 'grammar',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student1->id,
            'module_id' => $module->id,
            'enrolled_by' => $teacher->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($student2)
            ->get(route('reports.progress', $enrollment));

        $response->assertForbidden();
    }

    public function test_teacher_can_view_own_enrollment_report()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $subject = Subject::create(['name' => 'Science', 'slug' => 'science']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Biology',
            'slug' => 'biology',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'module_id' => $module->id,
            'enrolled_by' => $teacher->id,
            'status' => 'in_progress',
        ]);

        $response = $this->actingAs($teacher)
            ->get(route('reports.progress', $enrollment));

        $response->assertOk();
    }
}
