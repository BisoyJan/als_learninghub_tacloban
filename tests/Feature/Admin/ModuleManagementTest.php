<?php

namespace Tests\Feature\Admin;

use App\Models\LearningModule;
use App\Models\LearningResource;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ModuleManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->subject = Subject::create(['name' => 'Mathematics', 'slug' => 'mathematics']);
    }

    // ---------- Authorization ----------

    public function test_students_cannot_access_module_management()
    {
        $student = User::factory()->create(['role' => 'student']);
        $this->actingAs($student)->get(route('admin.modules.index'))->assertForbidden();
    }

    // ---------- Index ----------

    public function test_admin_can_view_modules_list()
    {
        LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->admin->id,
            'title' => 'Test Module',
            'slug' => 'test-module',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.modules.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/modules/index')
            ->has('modules.data', 1)
        );
    }

    // ---------- Create ----------

    public function test_admin_can_create_module()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.modules.store'), [
            'title' => 'New Module',
            'description' => 'A test module',
            'subject_id' => $this->subject->id,
            'level' => 'elementary',
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('admin.modules.index'));
        $this->assertDatabaseHas('learning_modules', ['title' => 'New Module']);
    }

    public function test_create_module_validates_required_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.modules.store'), []);

        $response->assertSessionHasErrors(['title', 'subject_id', 'level', 'status']);
    }

    // ---------- Update ----------

    public function test_admin_can_update_module()
    {
        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->admin->id,
            'title' => 'Original Title',
            'slug' => 'original-title',
            'level' => 'elementary',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.modules.update', $module), [
            'title' => 'Updated Title',
            'subject_id' => $this->subject->id,
            'level' => 'junior_high',
            'status' => 'published',
        ]);

        $response->assertRedirect(route('admin.modules.index'));
        $this->assertDatabaseHas('learning_modules', [
            'id' => $module->id,
            'title' => 'Updated Title',
            'status' => 'published',
        ]);
    }

    // ---------- Delete ----------

    public function test_admin_can_delete_module()
    {
        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->admin->id,
            'title' => 'To Delete',
            'slug' => 'to-delete',
            'level' => 'elementary',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.modules.destroy', $module));

        $response->assertRedirect(route('admin.modules.index'));
        $this->assertDatabaseMissing('learning_modules', ['id' => $module->id]);
    }

    // ---------- Resources ----------

    public function test_admin_can_upload_resource_to_module()
    {
        Storage::fake('public');

        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->admin->id,
            'title' => 'Module With Resource',
            'slug' => 'module-with-resource',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->admin)->post(route('admin.modules.resources.store', $module), [
            'title' => 'Test Document',
            'type' => 'pdf',
            'file' => $file,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('learning_resources', [
            'module_id' => $module->id,
            'title' => 'Test Document',
            'type' => 'pdf',
        ]);
    }

    public function test_admin_can_delete_resource()
    {
        Storage::fake('public');

        $module = LearningModule::create([
            'subject_id' => $this->subject->id,
            'created_by' => $this->admin->id,
            'title' => 'Module',
            'slug' => 'module-res',
            'level' => 'elementary',
            'status' => 'published',
        ]);

        $resource = LearningResource::create([
            'module_id' => $module->id,
            'uploaded_by' => $this->admin->id,
            'title' => 'To Delete Resource',
            'type' => 'link',
            'external_url' => 'https://example.com',
            'sort_order' => 0,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.modules.resources.destroy', [$module, $resource]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('learning_resources', ['id' => $resource->id]);
    }
}
