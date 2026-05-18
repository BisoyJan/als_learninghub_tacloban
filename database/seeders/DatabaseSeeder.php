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
            'education_level' => 'junior_high',
        ]);

        // Create additional test students
        User::factory()->create(['role' => 'student', 'education_level' => 'elementary', 'name' => 'Maria Santos', 'email' => 'maria@alsconnect.ph']);
        User::factory()->create(['role' => 'student', 'education_level' => 'elementary', 'name' => 'Juan dela Cruz', 'email' => 'juan@alsconnect.ph']);
        User::factory()->create(['role' => 'student', 'education_level' => 'junior_high', 'name' => 'Ana Reyes', 'email' => 'ana@alsconnect.ph']);
        User::factory()->create(['role' => 'student', 'education_level' => 'junior_high', 'name' => 'Carlo Mendoza', 'email' => 'carlo@alsconnect.ph']);
        User::factory()->create(['role' => 'student', 'education_level' => 'senior_high', 'name' => 'Lea Garcia', 'email' => 'lea@alsconnect.ph']);
        User::factory()->create(['role' => 'student', 'education_level' => 'senior_high', 'name' => 'Mark Torres', 'email' => 'mark@alsconnect.ph']);
        User::factory(4)->create(['role' => 'student'])->each(function ($user) {
            $user->update(['education_level' => ['elementary', 'junior_high', 'senior_high'][array_rand(['elementary', 'junior_high', 'senior_high'])]]);
        });

        // Seed learning modules & subjects
        $this->call(LearningModuleSeeder::class);

        // Seed sample enrollments & progress records
        $this->call(EnrollmentSeeder::class);

        // Seed announcements, forum categories, threads & replies
        $this->call(CommunicationSeeder::class);
    }
}
