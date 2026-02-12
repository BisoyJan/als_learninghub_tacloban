<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the appropriate dashboard based on user role.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            'admin' => Inertia::render('dashboard/admin-dashboard'),
            'teacher' => Inertia::render('dashboard/teacher-dashboard'),
            default => Inertia::render('dashboard/student-dashboard'),
        };
    }
}
