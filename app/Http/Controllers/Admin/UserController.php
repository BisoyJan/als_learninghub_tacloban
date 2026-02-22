<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        // Search by name or email
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'teacher', 'student'])],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'editUser' => $user->only('id', 'name', 'email', 'role', 'is_active', 'created_at'),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            'role' => ['required', Rule::in(['admin', 'teacher', 'student'])],
            'is_active' => ['boolean'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->is_active = $validated['is_active'] ?? true;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user, Request $request): RedirectResponse
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user, Request $request): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User {$status} successfully.");
    }

    /**
     * Export users to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = User::query();

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($request->has('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $users = $query->orderBy('name')->get();

        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');

            // CSV Header
            fputcsv($handle, ['Name', 'Email', 'Role', 'Status', 'Joined']);

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->name,
                    $user->email,
                    $user->role,
                    $user->is_active ? 'active' : 'inactive',
                    $user->created_at->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        }, 'users_export_' . now()->format('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Import users from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        // Skip header row
        $header = fgetcsv($handle);

        if (!$header) {
            fclose($handle);
            return back()->with('error', 'The CSV file is empty.');
        }

        // Normalize header keys
        $header = array_map(fn ($col) => strtolower(trim($col)), $header);

        $required = ['name', 'email', 'role'];
        $missing = array_diff($required, $header);
        if (!empty($missing)) {
            fclose($handle);
            return back()->with('error', 'CSV is missing required columns: ' . implode(', ', $missing) . '. Required: name, email, role.');
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($header, array_pad($data, count($header), ''));

            $name = trim($record['name'] ?? '');
            $email = trim($record['email'] ?? '');
            $role = strtolower(trim($record['role'] ?? ''));

            // Validate
            if (empty($name) || empty($email)) {
                $errors[] = "Row {$row}: Name and email are required.";
                $skipped++;
                continue;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Row {$row}: Invalid email '{$email}'.";
                $skipped++;
                continue;
            }

            if (!in_array($role, ['admin', 'teacher', 'student'])) {
                $errors[] = "Row {$row}: Invalid role '{$role}'. Must be admin, teacher, or student.";
                $skipped++;
                continue;
            }

            // Check for duplicate email
            if (User::where('email', $email)->exists()) {
                $errors[] = "Row {$row}: Email '{$email}' already exists.";
                $skipped++;
                continue;
            }

            // Determine password and status
            $password = trim($record['password'] ?? '');
            $status = strtolower(trim($record['status'] ?? 'active'));

            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password ?: 'password'),
                'role' => $role,
                'is_active' => $status !== 'inactive',
            ]);

            $imported++;
        }

        fclose($handle);

        $message = "{$imported} user(s) imported successfully.";
        if ($skipped > 0) {
            $message .= " {$skipped} row(s) skipped.";
        }

        if (!empty($errors)) {
            return back()->with('success', $message)->with('importErrors', array_slice($errors, 0, 10));
        }

        return back()->with('success', $message);
    }

    /**
     * Download a CSV template for user import.
     */
    public function template(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['name', 'email', 'role', 'password', 'status']);
            fputcsv($handle, ['Juan Dela Cruz', 'juan@example.com', 'student', 'password123', 'active']);
            fputcsv($handle, ['Maria Santos', 'maria@example.com', 'teacher', 'password123', 'active']);

            fclose($handle);
        }, 'user_import_template.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
