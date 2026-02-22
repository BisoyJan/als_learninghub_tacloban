<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_admin_dashboard_shows_correct_stats()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->count(2)->create(['role' => 'teacher']);

        $this->actingAs($admin);
        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard/admin-dashboard')
            ->has('stats')
            ->where('stats.students', 3)
            ->where('stats.teachers', 2)
        );
    }

    public function test_teacher_dashboard_renders_correctly()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher);
        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard/teacher-dashboard')
            ->has('stats')
        );
    }

    public function test_student_dashboard_renders_correctly()
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student);
        $response = $this->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard/student-dashboard')
            ->has('stats')
        );
    }
}
