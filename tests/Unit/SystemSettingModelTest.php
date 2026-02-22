<?php

namespace Tests\Unit;

use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemSettingModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_value_returns_default_when_not_set()
    {
        $this->assertEquals('default', SystemSetting::getValue('nonexistent', 'default'));
    }

    public function test_set_value_creates_new_setting()
    {
        SystemSetting::setValue('test_key', 'test_value', 'general');

        $this->assertDatabaseHas('system_settings', [
            'key' => 'test_key',
            'value' => 'test_value',
            'group' => 'general',
        ]);
    }

    public function test_set_value_updates_existing_setting()
    {
        SystemSetting::setValue('test_key', 'original', 'general');
        SystemSetting::setValue('test_key', 'updated', 'general');

        $this->assertEquals('updated', SystemSetting::getValue('test_key'));
        $this->assertEquals(1, SystemSetting::where('key', 'test_key')->count());
    }

    public function test_get_group_returns_settings_array()
    {
        SystemSetting::setValue('key1', 'val1', 'academic');
        SystemSetting::setValue('key2', 'val2', 'academic');
        SystemSetting::setValue('key3', 'val3', 'general');

        $academic = SystemSetting::getGroup('academic');
        $this->assertCount(2, $academic);
        $this->assertEquals('val1', $academic['key1']);
        $this->assertEquals('val2', $academic['key2']);
    }
}
