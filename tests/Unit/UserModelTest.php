<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_is_admin()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isTeacher());
        $this->assertFalse($user->isStudent());
    }

    public function test_user_is_teacher()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->assertFalse($user->isAdmin());
        $this->assertTrue($user->isTeacher());
        $this->assertFalse($user->isStudent());
    }

    public function test_user_is_student()
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isTeacher());
        $this->assertTrue($user->isStudent());
    }

    public function test_user_has_enrollments_relationship()
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->enrollments());
    }

    public function test_password_is_hashed()
    {
        $user = User::factory()->create(['password' => 'plain-password']);
        $this->assertNotEquals('plain-password', $user->password);
    }
}
