<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    /**
     * Seed the default badges.
     */
    public function run(): void
    {
        $badges = [
            [
                'slug' => 'module-completed',
                'name' => 'Module Complete',
                'description' => 'Completed a learning module',
                'icon' => 'award',
                'color' => 'green',
                'type' => 'completion',
            ],
            [
                'slug' => 'first-module',
                'name' => 'First Steps',
                'description' => 'Completed your first learning module',
                'icon' => 'star',
                'color' => 'amber',
                'type' => 'milestone',
            ],
            [
                'slug' => 'five-modules',
                'name' => 'Dedicated Learner',
                'description' => 'Completed 5 learning modules',
                'icon' => 'trophy',
                'color' => 'blue',
                'type' => 'milestone',
            ],
            [
                'slug' => 'ten-modules',
                'name' => 'Knowledge Seeker',
                'description' => 'Completed 10 learning modules',
                'icon' => 'medal',
                'color' => 'purple',
                'type' => 'milestone',
            ],
            [
                'slug' => 'honor-student',
                'name' => 'Honor Student',
                'description' => 'Achieved an average score of 90% or higher',
                'icon' => 'graduation-cap',
                'color' => 'indigo',
                'type' => 'milestone',
            ],
            [
                'slug' => 'perfect-score',
                'name' => 'Perfect Score',
                'description' => 'Achieved a perfect 100% average score',
                'icon' => 'sparkles',
                'color' => 'yellow',
                'type' => 'milestone',
            ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge,
            );
        }
    }
}
