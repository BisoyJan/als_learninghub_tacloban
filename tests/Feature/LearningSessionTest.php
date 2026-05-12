<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\LearningSession;
use App\Models\SessionAttendance;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningSessionTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private User $otherTeacher;
    private User $student;
    private User $admin;
    private LearningModule $module;
    private LearningSession $session;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->otherTeacher = User::factory()->create(['role' => 'teacher']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $subject = Subject::create(['name' => 'Science', 'slug' => 'science']);
        $this->module = LearningModule::create([
            'subject_id' => $subject->id,
            'created_by' => $this->teacher->id,
            'title' => 'Earth Science',
            'slug' => 'earth-science',
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $this->session = LearningSession::create([
            'module_id' => $this->module->id,
            'teacher_id' => $this->teacher->id,
            'title' => 'Session 1',
            'scheduled_at' => now()->addDays(3),
            'duration_minutes' => 60,
            'mode' => 'in_person',
            'status' => 'upcoming',
        ]);
    }

    // ---------- Authorization: index ----------

    public function test_guests_cannot_access_sessions_index()
    {
        $this->get(route('sessions.index'))->assertRedirect(route('login'));
    }

    public function test_student_can_view_sessions_index()
    {
        $response = $this->actingAs($this->student)->get(route('sessions.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('sessions/index'));
    }

    public function test_teacher_can_view_sessions_index()
    {
        $response = $this->actingAs($this->teacher)->get(route('sessions.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('sessions/index'));
    }

    public function test_admin_can_view_sessions_index()
    {
        $response = $this->actingAs($this->admin)->get(route('sessions.index'));
        $response->assertOk();
    }

    // ---------- Authorization: store ----------

    public function test_student_cannot_create_session()
    {
        $this->actingAs($this->student)
            ->post(route('sessions.store'), [])
            ->assertForbidden();
    }

    public function test_teacher_can_create_session()
    {
        $response = $this->actingAs($this->teacher)->post(route('sessions.store'), [
            'module_id' => $this->module->id,
            'title' => 'New Session',
            'scheduled_at' => now()->addDays(5)->toDateTimeString(),
            'duration_minutes' => 90,
            'mode' => 'online',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_sessions', [
            'teacher_id' => $this->teacher->id,
            'module_id' => $this->module->id,
            'title' => 'New Session',
            'status' => 'upcoming',
        ]);
    }

    public function test_create_session_validates_required_fields()
    {
        $response = $this->actingAs($this->teacher)->post(route('sessions.store'), []);

        $response->assertSessionHasErrors(['module_id', 'title', 'scheduled_at', 'duration_minutes', 'mode']);
    }

    public function test_create_session_rejects_past_scheduled_at()
    {
        $response = $this->actingAs($this->teacher)->post(route('sessions.store'), [
            'module_id' => $this->module->id,
            'title' => 'Past Session',
            'scheduled_at' => now()->subDay()->toDateTimeString(),
            'duration_minutes' => 60,
            'mode' => 'in_person',
        ]);

        $response->assertSessionHasErrors(['scheduled_at']);
    }

    // ---------- Show ----------

    public function test_teacher_can_view_own_session()
    {
        $response = $this->actingAs($this->teacher)->get(route('sessions.show', $this->session));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('sessions/show'));
    }

    public function test_teacher_cannot_view_other_teachers_session()
    {
        $this->actingAs($this->otherTeacher)
            ->get(route('sessions.show', $this->session))
            ->assertForbidden();
    }

    public function test_admin_can_view_any_session()
    {
        $this->actingAs($this->admin)
            ->get(route('sessions.show', $this->session))
            ->assertOk();
    }

    // ---------- Update ----------

    public function test_teacher_can_update_own_session()
    {
        $response = $this->actingAs($this->teacher)->put(route('sessions.update', $this->session), [
            'title' => 'Updated Title',
            'scheduled_at' => now()->addDays(7)->toDateTimeString(),
            'duration_minutes' => 45,
            'mode' => 'hybrid',
            'status' => 'upcoming',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_sessions', [
            'id' => $this->session->id,
            'title' => 'Updated Title',
            'mode' => 'hybrid',
        ]);
    }

    public function test_teacher_cannot_update_other_teachers_session()
    {
        $this->actingAs($this->otherTeacher)->put(route('sessions.update', $this->session), [
            'title' => 'Hacked',
            'scheduled_at' => now()->addDays(7)->toDateTimeString(),
            'duration_minutes' => 60,
            'mode' => 'in_person',
            'status' => 'upcoming',
        ])->assertForbidden();
    }

    public function test_admin_can_update_any_session()
    {
        $response = $this->actingAs($this->admin)->put(route('sessions.update', $this->session), [
            'title' => 'Admin Updated',
            'scheduled_at' => now()->addDays(7)->toDateTimeString(),
            'duration_minutes' => 60,
            'mode' => 'online',
            'status' => 'upcoming',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_sessions', ['id' => $this->session->id, 'title' => 'Admin Updated']);
    }

    // ---------- Destroy ----------

    public function test_teacher_can_delete_own_session()
    {
        $this->actingAs($this->teacher)
            ->delete(route('sessions.destroy', $this->session))
            ->assertRedirect(route('sessions.index'));

        $this->assertDatabaseMissing('learning_sessions', ['id' => $this->session->id]);
    }

    public function test_teacher_cannot_delete_other_teachers_session()
    {
        $this->actingAs($this->otherTeacher)
            ->delete(route('sessions.destroy', $this->session))
            ->assertForbidden();

        $this->assertDatabaseHas('learning_sessions', ['id' => $this->session->id]);
    }

    public function test_student_cannot_delete_session()
    {
        $this->actingAs($this->student)
            ->delete(route('sessions.destroy', $this->session))
            ->assertForbidden();
    }

    // ---------- Mark Attendance ----------

    public function test_teacher_can_mark_attendance()
    {
        $response = $this->actingAs($this->teacher)->post(route('sessions.attendance', $this->session), [
            'student_id' => $this->student->id,
            'status' => 'present',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('session_attendances', [
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'status' => 'present',
            'marked_by' => $this->teacher->id,
        ]);
    }

    public function test_mark_attendance_updates_existing_record()
    {
        SessionAttendance::create([
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'marked_by' => $this->teacher->id,
            'status' => 'present',
            'marked_at' => now(),
        ]);

        $this->actingAs($this->teacher)->post(route('sessions.attendance', $this->session), [
            'student_id' => $this->student->id,
            'status' => 'late',
            'remarks' => 'Came in 10 minutes late',
        ]);

        $this->assertDatabaseHas('session_attendances', [
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'status' => 'late',
        ]);
        $this->assertDatabaseCount('session_attendances', 1);
    }

    public function test_mark_attendance_validates_required_fields()
    {
        $this->actingAs($this->teacher)
            ->post(route('sessions.attendance', $this->session), [])
            ->assertSessionHasErrors(['student_id', 'status']);
    }

    public function test_student_cannot_mark_attendance()
    {
        $this->actingAs($this->student)
            ->post(route('sessions.attendance', $this->session), [
                'student_id' => $this->student->id,
                'status' => 'present',
            ])
            ->assertForbidden();
    }

    // ---------- Bulk Absent ----------

    public function test_bulk_absent_marks_unmarked_students()
    {
        $student2 = User::factory()->create(['role' => 'student']);

        // Enroll both students
        Enrollment::create([
            'student_id' => $this->student->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);
        Enrollment::create([
            'student_id' => $student2->id,
            'module_id' => $this->module->id,
            'enrolled_by' => $this->teacher->id,
            'status' => 'enrolled',
        ]);

        // Mark first student as present already
        SessionAttendance::create([
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'marked_by' => $this->teacher->id,
            'status' => 'present',
            'marked_at' => now(),
        ]);

        $this->actingAs($this->teacher)
            ->post(route('sessions.bulk-absent', $this->session))
            ->assertRedirect();

        // Student 2 should now be absent
        $this->assertDatabaseHas('session_attendances', [
            'session_id' => $this->session->id,
            'student_id' => $student2->id,
            'status' => 'absent',
        ]);

        // Student 1 should remain present
        $this->assertDatabaseHas('session_attendances', [
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'status' => 'present',
        ]);

        $this->assertDatabaseCount('session_attendances', 2);
    }

    // ---------- Learner History ----------

    public function test_student_can_view_own_attendance_history()
    {
        SessionAttendance::create([
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'marked_by' => $this->teacher->id,
            'status' => 'present',
            'marked_at' => now(),
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('sessions.learner.history', $this->student));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('sessions/attendance-history'));
    }

    public function test_student_cannot_view_other_students_history()
    {
        $otherStudent = User::factory()->create(['role' => 'student']);

        $this->actingAs($this->student)
            ->get(route('sessions.learner.history', $otherStudent))
            ->assertForbidden();
    }

    public function test_teacher_can_view_any_student_history()
    {
        $response = $this->actingAs($this->teacher)
            ->get(route('sessions.learner.history', $this->student));

        $response->assertOk();
    }

    public function test_learner_history_shows_correct_summary()
    {
        $session2 = LearningSession::create([
            'module_id' => $this->module->id,
            'teacher_id' => $this->teacher->id,
            'title' => 'Session 2',
            'scheduled_at' => now()->addDays(5),
            'duration_minutes' => 60,
            'mode' => 'online',
            'status' => 'upcoming',
        ]);

        SessionAttendance::create([
            'session_id' => $this->session->id,
            'student_id' => $this->student->id,
            'marked_by' => $this->teacher->id,
            'status' => 'present',
            'marked_at' => now(),
        ]);
        SessionAttendance::create([
            'session_id' => $session2->id,
            'student_id' => $this->student->id,
            'marked_by' => $this->teacher->id,
            'status' => 'absent',
            'marked_at' => now(),
        ]);

        $response = $this->actingAs($this->teacher)
            ->get(route('sessions.learner.history', $this->student));

        $response->assertInertia(fn ($page) => $page
            ->where('summary.total', 2)
            ->where('summary.present', 1)
            ->where('summary.absent', 1)
        );
    }
}
