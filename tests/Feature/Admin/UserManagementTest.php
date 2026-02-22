<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    // ---------- Authorization ----------

    public function test_students_cannot_access_user_management()
    {
        $student = User::factory()->create(['role' => 'student']);
        $this->actingAs($student)->get(route('admin.users.index'))->assertForbidden();
    }

    public function test_teachers_cannot_access_user_management()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($teacher)->get(route('admin.users.index'))->assertForbidden();
    }

    // ---------- Index ----------

    public function test_admin_can_view_users_list()
    {
        User::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 6) // 5 + admin
        );
    }

    public function test_admin_can_filter_users_by_role()
    {
        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->count(2)->create(['role' => 'teacher']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index', ['role' => 'student']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 3)
        );
    }

    public function test_admin_can_search_users()
    {
        User::factory()->create(['name' => 'Juan Dela Cruz', 'role' => 'student']);
        User::factory()->create(['name' => 'Maria Santos', 'role' => 'student']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.users.index', ['search' => 'Juan']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
        );
    }

    // ---------- Create ----------

    public function test_admin_can_create_user()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'New Student',
            'email' => 'newstudent@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'student',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'newstudent@test.com',
            'role' => 'student',
        ]);
    }

    public function test_create_user_validates_required_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), []);

        $response->assertSessionHasErrors(['name', 'email', 'password', 'role']);
    }

    public function test_create_user_rejects_duplicate_email()
    {
        User::factory()->create(['email' => 'existing@test.com']);

        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'Dup User',
            'email' => 'existing@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'student',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    // ---------- Update ----------

    public function test_admin_can_update_user()
    {
        $user = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($this->admin)->put(route('admin.users.update', $user), [
            'name' => 'Updated Name',
            'email' => $user->email,
            'role' => 'teacher',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'role' => 'teacher',
        ]);
    }

    // ---------- Delete ----------

    public function test_admin_can_delete_user()
    {
        $user = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $user));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_self()
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->admin));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    // ---------- Toggle Status ----------

    public function test_admin_can_toggle_user_status()
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.users.toggle-status', $user));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
    }

    public function test_admin_cannot_deactivate_self()
    {
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.users.toggle-status', $this->admin));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    // ---------- Export ----------

    public function test_admin_can_export_users_csv()
    {
        User::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.users.export'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    // ---------- Import ----------

    public function test_admin_can_import_users_from_csv()
    {
        $csvContent = "name,email,role,password,status\nJuan Dela Cruz,juan@import.com,student,pass123,active\nMaria Santos,maria@import.com,teacher,pass456,active";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('admin.users.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['email' => 'juan@import.com']);
        $this->assertDatabaseHas('users', ['email' => 'maria@import.com']);
    }

    public function test_import_skips_duplicate_emails()
    {
        User::factory()->create(['email' => 'existing@import.com']);

        $csvContent = "name,email,role\nExisting User,existing@import.com,student";
        $file = UploadedFile::fake()->createWithContent('users.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('admin.users.import'), [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $this->assertEquals(1, User::where('email', 'existing@import.com')->count());
    }

    // ---------- Template ----------

    public function test_admin_can_download_import_template()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.template'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
