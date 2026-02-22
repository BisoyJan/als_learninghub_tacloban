<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\CommunicationSeeder;
use Database\Seeders\EnrollmentSeeder;
use Database\Seeders\LearningModuleSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@alsconnect.ph',
            'role' => 'admin',
        ]);

        // Create teacher user
        User::factory()->create([
            'name' => 'Teacher User',
            'email' => 'teacher@alsconnect.ph',
            'role' => 'teacher',
        ]);

        // Create student user
        User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@alsconnect.ph',
            'role' => 'student',
        ]);

        // Create additional test students
        User::factory(10)->create([
            'role' => 'student',
        ]);

        // Seed learning modules & subjects
        $this->call(LearningModuleSeeder::class);

        // Seed sample enrollments & progress records
        $this->call(EnrollmentSeeder::class);

        // Seed announcements, forum categories, threads & replies
        $this->call(CommunicationSeeder::class);
    }
}
