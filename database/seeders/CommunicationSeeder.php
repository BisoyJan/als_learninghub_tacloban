<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumThread;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommunicationSeeder extends Seeder
{
    /**
     * Seed announcements, forum categories, threads, and replies.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@alsconnect.ph')->first();
        $teacher = User::where('email', 'teacher@alsconnect.ph')->first();
        $student = User::where('email', 'student@alsconnect.ph')->first();

        if (!$admin || !$teacher || !$student) {
            return;
        }

        // --- Announcements ---
        Announcement::create([
            'author_id' => $admin->id,
            'title' => 'Welcome to ALS Connect Tacloban!',
            'body' => "We are excited to launch ALS Connect Tacloban, your new digital hub for learning, communication, and progress tracking.\n\nPlease take time to explore the platform and familiarize yourself with the available features. If you have any questions, feel free to use the Community Forum or contact your teacher.\n\nThank you for being part of our learning community!",
            'audience' => 'all',
            'is_pinned' => true,
            'published_at' => now()->subDays(7),
        ]);

        Announcement::create([
            'author_id' => $admin->id,
            'title' => 'Enrollment Period Open for 2025-2026',
            'body' => "The enrollment period for the school year 2025-2026 is now open. Please coordinate with your assigned teacher for module enrollment.\n\nRequired documents:\n- Valid ID or barangay certification\n- Previous learning records (if any)\n\nDeadline: End of August 2025",
            'audience' => 'students',
            'is_pinned' => false,
            'published_at' => now()->subDays(5),
        ]);

        Announcement::create([
            'author_id' => $admin->id,
            'title' => 'Teacher Training Schedule',
            'body' => "A training workshop on using the ALS Connect platform will be held on August 20, 2025 at the Anibong Learning Center.\n\nTopics:\n- Module management and uploads\n- Student progress tracking\n- Using the gradebook\n\nPlease confirm your attendance.",
            'audience' => 'teachers',
            'is_pinned' => false,
            'published_at' => now()->subDays(3),
        ]);

        Announcement::create([
            'author_id' => $teacher->id,
            'title' => 'New Learning Resources Available',
            'body' => "I have uploaded new learning materials for Communication Skills and Mathematics modules. Please check the Digital Library for the latest resources.\n\nDon't hesitate to ask if you need help accessing them.",
            'audience' => 'all',
            'is_pinned' => false,
            'published_at' => now()->subDays(1),
        ]);

        // Draft announcement
        Announcement::create([
            'author_id' => $admin->id,
            'title' => 'Upcoming Assessment Schedule',
            'body' => "The quarterly assessment will be conducted on September 15-17, 2025. More details will follow.",
            'audience' => 'all',
            'is_pinned' => false,
            'published_at' => null,
        ]);

        // --- Forum Categories ---
        $generalCat = ForumCategory::create([
            'name' => 'General Discussion',
            'slug' => 'general-discussion',
            'description' => 'General topics and conversations',
            'color' => '#6366f1',
            'sort_order' => 1,
        ]);

        $helpCat = ForumCategory::create([
            'name' => 'Help & Questions',
            'slug' => 'help-questions',
            'description' => 'Ask for help with modules or the platform',
            'color' => '#10b981',
            'sort_order' => 2,
        ]);

        $resourcesCat = ForumCategory::create([
            'name' => 'Study Resources',
            'slug' => 'study-resources',
            'description' => 'Share and recommend helpful study materials',
            'color' => '#f59e0b',
            'sort_order' => 3,
        ]);

        $feedbackCat = ForumCategory::create([
            'name' => 'Feedback & Suggestions',
            'slug' => 'feedback-suggestions',
            'description' => 'Share your ideas to improve the platform',
            'color' => '#ef4444',
            'sort_order' => 4,
        ]);

        // --- Forum Threads & Replies ---

        // Thread 1: General discussion
        $thread1 = ForumThread::create([
            'user_id' => $student->id,
            'category_id' => $generalCat->id,
            'title' => 'Introduce yourself here!',
            'body' => "Hi everyone! I'm a new ALS learner at Anibong Learning Center. Let's use this thread to introduce ourselves and get to know each other.\n\nI'm currently enrolled in Communication Skills and Mathematics modules. Looking forward to learning with all of you!",
            'is_pinned' => true,
        ]);

        ForumReply::create([
            'thread_id' => $thread1->id,
            'user_id' => $teacher->id,
            'body' => "Welcome! I'm Teacher User, your facilitator. Feel free to reach out if you need help with any module. Happy learning!",
        ]);

        ForumReply::create([
            'thread_id' => $thread1->id,
            'user_id' => User::where('role', 'student')->where('id', '!=', $student->id)->first()?->id ?? $student->id,
            'body' => "Hello! I'm also a new learner here. Excited to be part of this community!",
        ]);

        // Thread 2: Help question
        $thread2 = ForumThread::create([
            'user_id' => $student->id,
            'category_id' => $helpCat->id,
            'title' => 'How do I submit assignments through the platform?',
            'body' => "I completed my worksheet for Communication Skills Module 1, but I'm not sure how to submit it through ALS Connect. Can someone guide me?",
        ]);

        ForumReply::create([
            'thread_id' => $thread2->id,
            'user_id' => $teacher->id,
            'body' => "Great question! Currently, you can track your progress through the Progress Tracking section. Your teacher will record your scores after reviewing your work. You can bring your worksheets during our face-to-face sessions, or you can send a photo through the platform.",
        ]);

        // Thread 3: Study resources
        ForumThread::create([
            'user_id' => $teacher->id,
            'category_id' => $resourcesCat->id,
            'title' => 'Recommended Online Resources for Mathematics',
            'body' => "Here are some free online resources that can help with your Mathematics modules:\n\n1. Khan Academy (free math courses)\n2. GeoGebra (interactive math tools)\n3. Math-Drills.com (practice worksheets)\n\nLet me know if you need help accessing any of these!",
        ]);

        // Thread 4: Feedback
        ForumThread::create([
            'user_id' => $student->id,
            'category_id' => $feedbackCat->id,
            'title' => 'Can we add a chat feature?',
            'body' => "It would be great to have a real-time chat feature on the platform so we can quickly ask questions to our teachers. The forum is helpful but sometimes we need instant answers.",
        ]);

        ForumReply::create([
            'thread_id' => ForumThread::where('title', 'Can we add a chat feature?')->first()->id,
            'user_id' => $admin->id,
            'body' => "Thank you for the suggestion! We'll consider adding a messaging feature in future updates. For now, the forum is the best place for discussions.",
        ]);
    }
}
