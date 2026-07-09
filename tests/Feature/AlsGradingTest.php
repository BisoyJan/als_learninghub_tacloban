<?php

namespace Tests\Feature;

use App\Models\AeTestResult;
use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AlsGradingTest extends TestCase
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

        $subject = Subject::create(['name' => 'Mathematics', 'slug' => 'mathematics', 'strand_code' => 'LS3']);
        $module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $this->teacher->id,
            'title' => 'Algebra Basics',
            'slug' => 'algebra-basics',
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

    // ---------- Learning strand ----------

    public function test_subject_exposes_strand_label()
    {
        $subject = Subject::create(['name' => 'English', 'slug' => 'english', 'strand_code' => 'LS1']);

        $this->assertSame('LS1 - Communication Skills', $subject->strand_label);
    }

    public function test_subject_without_strand_has_null_label()
    {
        $subject = Subject::create(['name' => 'Custom', 'slug' => 'custom']);

        $this->assertNull($subject->strand_label);
    }

    // ---------- Competency band derivation ----------

    #[DataProvider('competencyBandProvider')]
    public function test_derive_competency_level_maps_percentage_to_band(float $percentage, string $expected)
    {
        $this->assertSame($expected, ProgressRecord::deriveCompetencyLevel($percentage));
    }

    public static function competencyBandProvider(): array
    {
        return [
            'mastered top' => [100.0, 'mastered'],
            'mastered lower' => [90.0, 'mastered'],
            'proficient' => [85.0, 'proficient'],
            'developing' => [75.0, 'developing'],
            'beginning' => [74.9, 'beginning'],
            'beginning zero' => [0.0, 'beginning'],
        ];
    }

    public function test_derive_competency_level_null_for_null_percentage()
    {
        $this->assertNull(ProgressRecord::deriveCompetencyLevel(null));
    }

    public function test_add_record_auto_derives_competency_from_score()
    {
        $this->actingAs($this->teacher)->post(route('gradebook.records.store', $this->enrollment), [
            'title' => 'Module 1 Quiz',
            'type' => 'assessment',
            'score' => 85,
            'max_score' => 100,
            'recorded_date' => now()->toDateString(),
        ])->assertRedirect();

        $this->assertDatabaseHas('progress_records', [
            'enrollment_id' => $this->enrollment->id,
            'competency_level' => 'proficient',
        ]);
    }

    public function test_add_record_accepts_explicit_competency_level()
    {
        $this->actingAs($this->teacher)->post(route('gradebook.records.store', $this->enrollment), [
            'title' => 'Portfolio Review',
            'type' => 'milestone',
            'competency_level' => 'mastered',
            'recorded_date' => now()->toDateString(),
        ])->assertRedirect();

        $this->assertDatabaseHas('progress_records', [
            'enrollment_id' => $this->enrollment->id,
            'competency_level' => 'mastered',
        ]);
    }

    public function test_progress_record_exposes_competency_descriptor()
    {
        $record = $this->enrollment->progressRecords()->create([
            'recorded_by' => $this->teacher->id,
            'title' => 'Quiz',
            'type' => 'assessment',
            'score' => 92,
            'max_score' => 100,
            'recorded_date' => now()->toDateString(),
        ]);

        $this->assertSame('Mastered', $record->competency_descriptor);
    }

    // ---------- A&E test results ----------

    public function test_teacher_can_record_ae_result()
    {
        $this->actingAs($this->teacher)->post(route('gradebook.ae-results.store', $this->enrollment), [
            'level' => 'junior_high',
            'test_date' => now()->toDateString(),
            'overall_score' => 88,
            'result' => 'passed',
            'certificate_no' => 'AE-2026-001',
        ])->assertRedirect();

        $this->assertDatabaseHas('als_ae_results', [
            'student_id' => $this->student->id,
            'level' => 'junior_high',
            'result' => 'passed',
            'certificate_no' => 'AE-2026-001',
        ]);
    }

    public function test_recording_ae_result_twice_for_same_level_updates_existing()
    {
        $payload = [
            'level' => 'junior_high',
            'test_date' => now()->toDateString(),
            'result' => 'failed',
        ];

        $this->actingAs($this->teacher)->post(route('gradebook.ae-results.store', $this->enrollment), $payload)->assertRedirect();
        $this->actingAs($this->teacher)->post(route('gradebook.ae-results.store', $this->enrollment), [
            ...$payload,
            'result' => 'passed',
        ])->assertRedirect();

        $this->assertSame(1, AeTestResult::where('student_id', $this->student->id)->count());
        $this->assertDatabaseHas('als_ae_results', [
            'student_id' => $this->student->id,
            'level' => 'junior_high',
            'result' => 'passed',
        ]);
    }

    public function test_teacher_can_delete_ae_result()
    {
        $result = AeTestResult::create([
            'student_id' => $this->student->id,
            'recorded_by' => $this->teacher->id,
            'level' => 'elementary',
            'test_date' => now()->toDateString(),
            'result' => 'passed',
        ]);

        $this->actingAs($this->teacher)->delete(route('gradebook.ae-results.destroy', [$this->enrollment, $result]))->assertRedirect();

        $this->assertDatabaseMissing('als_ae_results', ['id' => $result->id]);
    }

    public function test_students_cannot_record_ae_result()
    {
        $this->actingAs($this->student)->post(route('gradebook.ae-results.store', $this->enrollment), [
            'level' => 'junior_high',
            'test_date' => now()->toDateString(),
            'result' => 'passed',
        ])->assertForbidden();
    }

    public function test_show_page_includes_ae_results()
    {
        AeTestResult::create([
            'student_id' => $this->student->id,
            'recorded_by' => $this->teacher->id,
            'level' => 'junior_high',
            'test_date' => now()->toDateString(),
            'result' => 'passed',
        ]);

        $this->actingAs($this->teacher)->get(route('gradebook.show', $this->enrollment))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('gradebook/show')
                ->has('aeResults', 1));
    }
}
