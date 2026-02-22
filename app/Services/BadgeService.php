<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\UserBadge;

class BadgeService
{
    /**
     * Check and award badges when an enrollment is completed.
     */
    public function checkAndAwardBadges(User $user, Enrollment $enrollment): array
    {
        $awarded = [];

        // Module Completion badge — awarded for every completed module
        $badge = Badge::where('slug', 'module-completed')->first();
        if ($badge) {
            $exists = UserBadge::where('user_id', $user->id)
                ->where('badge_id', $badge->id)
                ->where('enrollment_id', $enrollment->id)
                ->exists();

            if (! $exists) {
                UserBadge::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'enrollment_id' => $enrollment->id,
                    'earned_at' => now(),
                ]);
                $awarded[] = $badge;
            }
        }

        // First Module badge — awarded on first-ever completion
        $completedCount = Enrollment::where('student_id', $user->id)->completed()->count();
        if ($completedCount === 1) {
            $this->awardBadgeOnce($user, 'first-module', $enrollment, $awarded);
        }

        // Five Modules badge
        if ($completedCount >= 5) {
            $this->awardBadgeOnce($user, 'five-modules', $enrollment, $awarded);
        }

        // Ten Modules badge
        if ($completedCount >= 10) {
            $this->awardBadgeOnce($user, 'ten-modules', $enrollment, $awarded);
        }

        // Honor Student — complete a module with average score >= 90
        if ($enrollment->average_score !== null && $enrollment->average_score >= 90) {
            $this->awardBadgeOnce($user, 'honor-student', $enrollment, $awarded);
        }

        // Perfect Score — complete a module with average score == 100
        if ($enrollment->average_score !== null && $enrollment->average_score >= 100) {
            $this->awardBadgeOnce($user, 'perfect-score', $enrollment, $awarded);
        }

        return $awarded;
    }

    /**
     * Award a badge once (no duplicate per user for the same slug).
     */
    private function awardBadgeOnce(User $user, string $slug, Enrollment $enrollment, array &$awarded): void
    {
        $badge = Badge::where('slug', $slug)->first();
        if (! $badge) {
            return;
        }

        $exists = UserBadge::where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->exists();

        if (! $exists) {
            UserBadge::create([
                'user_id' => $user->id,
                'badge_id' => $badge->id,
                'enrollment_id' => $enrollment->id,
                'earned_at' => now(),
            ]);
            $awarded[] = $badge;
        }
    }
}
