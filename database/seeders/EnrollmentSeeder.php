<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\LearningModule;
use App\Models\ProgressRecord;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    /**
     * Seed sample enrollments and progress records.
     */
    public function run(): void
    {
        $teacher = User::where('email', 'teacher@alsconnect.ph')->first();
        $students = User::where('role', 'student')->get();
        $modules = LearningModule::published()->get();

        if (!$teacher || $students->isEmpty() || $modules->isEmpty()) {
            return;
        }

        // Enroll each student in 2-3 random modules
        foreach ($students as $student) {
            $enrollModules = $modules->random(min(3, $modules->count()));

            foreach ($enrollModules as $index => $module) {
                $status = match ($index) {
                    0 => 'completed',
                    1 => 'in_progress',
                    default => 'enrolled',
                };

                $enrollment = Enrollment::create([
                    'student_id' => $student->id,
                    'module_id' => $module->id,
                    'enrolled_by' => $teacher->id,
                    'status' => $status,
                    'completed_at' => $status === 'completed' ? now()->subDays(rand(1, 30)) : null,
                ]);

                // Add progress records for completed and in-progress enrollments
                if ($status !== 'enrolled') {
                    $recordCount = $status === 'completed' ? rand(3, 5) : rand(1, 3);

                    for ($i = 0; $i < $recordCount; $i++) {
                        $type = ['assessment', 'activity', 'milestone'][array_rand(['assessment', 'activity', 'milestone'])];
                        $maxScore = [50, 100, 20, 30][array_rand([50, 100, 20, 30])];
                        $score = rand(intval($maxScore * 0.5), $maxScore);

                        ProgressRecord::create([
                            'enrollment_id' => $enrollment->id,
                            'recorded_by' => $teacher->id,
                            'title' => match ($type) {
                                'assessment' => 'Quiz ' . ($i + 1),
                                'activity' => 'Activity ' . ($i + 1) . ' - Worksheet',
                                'milestone' => 'Module ' . ($i + 1) . ' Checkpoint',
                            },
                            'type' => $type,
                            'score' => $score,
                            'max_score' => $maxScore,
                            'remarks' => $score >= ($maxScore * 0.75) ? 'Good performance.' : 'Needs improvement.',
                            'recorded_date' => now()->subDays(rand(1, 60)),
                        ]);
                    }
                }
            }
        }
    }
}
