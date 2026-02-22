<?php

namespace Tests\Feature\Admin;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_settings_page()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.settings.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/settings/index')
            ->has('settings')
        );
    }

    public function test_admin_can_update_settings()
    {
        $response = $this->actingAs($this->admin)->put(route('admin.settings.update'), [
            'school_year' => '2025-2026',
            'term' => '1st Semester',
            'center_name' => 'Anibong Learning Center',
            'center_address' => 'Anibong, Tacloban City',
            'contact_email' => 'admin@als.ph',
            'contact_phone' => '09171234567',
            'enrollment_open' => 'true',
            'max_students_per_class' => 35,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('2025-2026', SystemSetting::getValue('school_year'));
        $this->assertEquals('Anibong Learning Center', SystemSetting::getValue('center_name'));
    }

    public function test_settings_validates_required_fields()
    {
        $response = $this->actingAs($this->admin)->put(route('admin.settings.update'), []);

        $response->assertSessionHasErrors(['school_year', 'term', 'center_name', 'center_address']);
    }

    public function test_non_admin_cannot_access_settings()
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)->get(route('admin.settings.index'))->assertForbidden();
    }
}
