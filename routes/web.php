<?php

use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\GradebookController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Library routes (all authenticated users)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('library', [LibraryController::class, 'index'])->name('library.index');
    Route::get('library/{module:slug}', [LibraryController::class, 'show'])->name('library.show');
});

// Gradebook routes (teachers & admins)
Route::middleware(['auth', 'verified', 'role:teacher,admin'])->prefix('gradebook')->name('gradebook.')->group(function () {
    Route::get('/', [GradebookController::class, 'index'])->name('index');
    Route::post('enroll', [GradebookController::class, 'enroll'])->name('enroll');
    Route::get('{enrollment}', [GradebookController::class, 'show'])->name('show');
    Route::post('{enrollment}/records', [GradebookController::class, 'addRecord'])->name('records.store');
    Route::delete('{enrollment}/records/{record}', [GradebookController::class, 'deleteRecord'])->name('records.destroy');
    Route::patch('{enrollment}/status', [GradebookController::class, 'updateStatus'])->name('status');
});

// Student progress routes
Route::middleware(['auth', 'verified', 'role:student'])->prefix('progress')->name('progress.')->group(function () {
    Route::get('/', [ProgressController::class, 'index'])->name('index');
    Route::get('{enrollment}', [ProgressController::class, 'show'])->name('show');
});

// Report routes (all authenticated)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports/progress/{enrollment}', [ReportController::class, 'progressReport'])->name('reports.progress');
    Route::get('reports/certificate/{enrollment}', [ReportController::class, 'certificate'])->name('reports.certificate');
});

// Announcement routes (all authenticated users)
Route::middleware(['auth', 'verified'])->prefix('announcements')->name('announcements.')->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->name('index');
    Route::get('{announcement}', [AnnouncementController::class, 'show'])->name('show');
});

// Announcement management (teachers & admins)
Route::middleware(['auth', 'verified', 'role:teacher,admin'])->prefix('announcements-manage')->name('announcements.')->group(function () {
    Route::get('/', [AnnouncementController::class, 'manage'])->name('manage');
    Route::post('/', [AnnouncementController::class, 'store'])->name('store');
    Route::put('{announcement}', [AnnouncementController::class, 'update'])->name('update');
    Route::patch('{announcement}/publish', [AnnouncementController::class, 'publish'])->name('publish');
    Route::delete('{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
});

// Forum routes (all authenticated users)
Route::middleware(['auth', 'verified'])->prefix('forum')->name('forum.')->group(function () {
    Route::get('/', [ForumController::class, 'index'])->name('index');
    Route::get('create', [ForumController::class, 'create'])->name('create');
    Route::post('/', [ForumController::class, 'store'])->name('store');
    Route::get('{thread:slug}', [ForumController::class, 'show'])->name('show');
    Route::post('{thread:slug}/reply', [ForumController::class, 'reply'])->name('reply');
    Route::delete('threads/{thread}', [ForumController::class, 'destroyThread'])->name('threads.destroy');
    Route::delete('replies/{reply}', [ForumController::class, 'destroyReply'])->name('replies.destroy');
});

// Forum moderation (admin only)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('forum')->name('forum.')->group(function () {
    Route::patch('threads/{thread}/lock', [ForumController::class, 'toggleLock'])->name('threads.lock');
    Route::patch('threads/{thread}/pin', [ForumController::class, 'togglePin'])->name('threads.pin');
});

// Notification routes
Route::middleware(['auth', 'verified'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::patch('{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
    Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::get('users-export', [UserController::class, 'export'])->name('users.export');
    Route::post('users-import', [UserController::class, 'import'])->name('users.import');
    Route::get('users-template', [UserController::class, 'template'])->name('users.template');

    Route::resource('modules', ModuleController::class);
    Route::post('modules/{module}/resources', [ModuleController::class, 'uploadResource'])->name('modules.resources.store');
    Route::delete('modules/{module}/resources/{resource}', [ModuleController::class, 'deleteResource'])->name('modules.resources.destroy');

    Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
