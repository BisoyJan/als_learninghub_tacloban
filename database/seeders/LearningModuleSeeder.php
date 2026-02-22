<?php

namespace Database\Seeders;

use App\Models\LearningModule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LearningModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create ALS subjects
        $subjects = [
            ['name' => 'English', 'slug' => 'english', 'description' => 'Communication Arts - English'],
            ['name' => 'Filipino', 'slug' => 'filipino', 'description' => 'Communication Arts - Filipino'],
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'description' => 'Mathematical and Problem-Solving Skills'],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Scientific Literacy and Critical Thinking'],
            ['name' => 'Digital Literacy', 'slug' => 'digital-literacy', 'description' => 'Digital Literacy and Technology Skills'],
            ['name' => 'Life and Career Skills', 'slug' => 'life-career-skills', 'description' => 'Sustainable Use of Resources / Understanding the Self and Society'],
        ];

        foreach ($subjects as $subjectData) {
            Subject::firstOrCreate(['slug' => $subjectData['slug']], $subjectData);
        }

        // Create sample modules
        $teacher = User::where('role', 'teacher')->first();
        $admin = User::where('role', 'admin')->first();

        if (!$teacher || !$admin) {
            return;
        }

        $sampleModules = [
            [
                'subject' => 'english',
                'title' => 'Basic English Grammar',
                'description' => 'Learn the fundamentals of English grammar including parts of speech, sentence structure, and basic punctuation.',
                'level' => 'elementary',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
            [
                'subject' => 'english',
                'title' => 'Reading Comprehension Strategies',
                'description' => 'Develop essential reading skills for understanding and analyzing various text types.',
                'level' => 'junior_high',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
            [
                'subject' => 'mathematics',
                'title' => 'Basic Arithmetic Operations',
                'description' => 'Master addition, subtraction, multiplication, and division with whole numbers and fractions.',
                'level' => 'elementary',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
            [
                'subject' => 'mathematics',
                'title' => 'Introduction to Algebra',
                'description' => 'Understanding variables, expressions, and simple equations.',
                'level' => 'junior_high',
                'status' => 'draft',
                'created_by' => $admin->id,
            ],
            [
                'subject' => 'science',
                'title' => 'The Living World',
                'description' => 'Explore basic concepts of biology including plants, animals, and ecosystems.',
                'level' => 'elementary',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
            [
                'subject' => 'digital-literacy',
                'title' => 'Computer Basics',
                'description' => 'Introduction to using computers, internet safety, and basic digital tools.',
                'level' => 'elementary',
                'status' => 'published',
                'created_by' => $admin->id,
            ],
            [
                'subject' => 'life-career-skills',
                'title' => 'Financial Literacy Basics',
                'description' => 'Learn about budgeting, saving, and basic financial management for everyday life.',
                'level' => 'senior_high',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
            [
                'subject' => 'filipino',
                'title' => 'Pangunahing Gramatika ng Filipino',
                'description' => 'Pag-aaral ng mga pangunahing elemento ng gramatikang Filipino.',
                'level' => 'elementary',
                'status' => 'published',
                'created_by' => $teacher->id,
            ],
        ];

        foreach ($sampleModules as $moduleData) {
            $subject = Subject::where('slug', $moduleData['subject'])->first();
            if (!$subject) {
                continue;
            }

            LearningModule::firstOrCreate(
                ['title' => $moduleData['title']],
                [
                    'subject_id' => $subject->id,
                    'created_by' => $moduleData['created_by'],
                    'title' => $moduleData['title'],
                    'slug' => Str::slug($moduleData['title']) . '-' . Str::random(6),
                    'description' => $moduleData['description'],
                    'level' => $moduleData['level'],
                    'status' => $moduleData['status'],
                ]
            );
        }
    }
}
