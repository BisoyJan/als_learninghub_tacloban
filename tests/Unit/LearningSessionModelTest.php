<?php

namespace Tests\Unit;

use App\Models\LearningModule;
use App\Models\LearningSession;
use App\Models\SessionAttendance;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningSessionModelTest extends TestCase
{
    use RefreshDatabase;

    private LearningSession $session;

    protected function setUp(): void
    {
        parent::setUp();

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

        $this->session = LearningSession::create([
            'module_id' => $module->id,
            'teacher_id' => $teacher->id,
            'title' => 'Test Session',
            'scheduled_at' => now()->addDays(2),
            'duration_minutes' => 90,
            'mode' => 'in_person',
            'status' => 'upcoming',
        ]);
    }

    // ---------- mode_label ----------

    public function test_mode_label_in_person()
    {
        $this->session->mode = 'in_person';
        $this->assertEquals('In Person', $this->session->mode_label);
    }

    public function test_mode_label_online()
    {
        $this->session->mode = 'online';
        $this->assertEquals('Online', $this->session->mode_label);
    }

    public function test_mode_label_hybrid()
    {
        $this->session->mode = 'hybrid';
        $this->assertEquals('Hybrid', $this->session->mode_label);
    }

    // ---------- status_label ----------

    public function test_status_label_upcoming()
    {
        $this->session->status = 'upcoming';
        $this->assertEquals('Upcoming', $this->session->status_label);
    }

    public function test_status_label_ongoing()
    {
        $this->session->status = 'ongoing';
        $this->assertEquals('Ongoing', $this->session->status_label);
    }

    public function test_status_label_completed()
    {
        $this->session->status = 'completed';
        $this->assertEquals('Completed', $this->session->status_label);
    }

    public function test_status_label_cancelled()
    {
        $this->session->status = 'cancelled';
        $this->assertEquals('Cancelled', $this->session->status_label);
    }

    // ---------- ends_at ----------

    public function test_ends_at_is_scheduled_at_plus_duration()
    {
        $scheduledAt = now()->addDays(2)->setSecond(0)->setMicrosecond(0);
        $this->session->scheduled_at = $scheduledAt;
        $this->session->duration_minutes = 90;

        $expected = $scheduledAt->copy()->addMinutes(90)->toISOString();
        $this->assertEquals($expected, $this->session->ends_at);
    }

    public function test_ends_at_changes_with_duration()
    {
        $this->session->duration_minutes = 30;
        $expectedEnd = $this->session->scheduled_at->copy()->addMinutes(30)->toISOString();
        $this->assertEquals($expectedEnd, $this->session->ends_at);
    }

    // ---------- scopeUpcoming ----------

    public function test_upcoming_scope_returns_only_upcoming_future_sessions()
    {
        // Change existing session to upcoming + future (already is)
        $this->session->update(['status' => 'upcoming', 'scheduled_at' => now()->addDays(2)]);

        // Create a completed session
        LearningSession::create(array_merge($this->session->only([
            'module_id', 'teacher_id', 'duration_minutes', 'mode',
        ]), ['title' => 'Completed Session', 'scheduled_at' => now()->addDay(), 'status' => 'completed']));

        // Create a past upcoming session
        LearningSession::create(array_merge($this->session->only([
            'module_id', 'teacher_id', 'duration_minutes', 'mode',
        ]), ['title' => 'Past Session', 'scheduled_at' => now()->subDay(), 'status' => 'upcoming']));

        $upcoming = LearningSession::upcoming()->get();

        $this->assertCount(1, $upcoming);
        $this->assertEquals('Test Session', $upcoming->first()->title);
    }

    // ---------- scopeForModule ----------

    public function test_for_module_scope_filters_by_module_id()
    {
        $teacher = User::where('role', 'teacher')->first();
        $subject = Subject::create(['name' => 'Science', 'slug' => 'science']);
        $otherModule = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $teacher->id,
            'title' => 'Biology',
            'slug' => 'biology',
            'level' => 'senior_high',
            'status' => 'published',
        ]);

        LearningSession::create([
            'module_id' => $otherModule->id,
            'teacher_id' => $teacher->id,
            'title' => 'Biology Session',
            'scheduled_at' => now()->addDay(),
            'duration_minutes' => 60,
            'mode' => 'online',
            'status' => 'upcoming',
        ]);

        $forModule = LearningSession::forModule($this->session->module_id)->get();

        $this->assertCount(1, $forModule);
        $this->assertEquals($this->session->module_id, $forModule->first()->module_id);
    }

    // ---------- Relationships ----------

    public function test_teacher_relationship()
    {
        $this->assertInstanceOf(User::class, $this->session->teacher);
    }

    public function test_module_relationship()
    {
        $this->assertInstanceOf(LearningModule::class, $this->session->module);
    }

    public function test_attendances_relationship()
    {
        $student = User::factory()->create(['role' => 'student']);
        SessionAttendance::create([
            'session_id' => $this->session->id,
            'student_id' => $student->id,
            'marked_by' => $this->session->teacher_id,
            'status' => 'present',
            'marked_at' => now(),
        ]);

        $this->assertCount(1, $this->session->attendances);
        $this->assertEquals('present', $this->session->attendances->first()->status);
    }
}
