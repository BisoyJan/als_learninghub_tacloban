<?php

namespace Tests\Unit;

use App\Http\Middleware\EnsureUserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class EnsureUserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_allows_matching_role()
    {
        $user = User::factory()->create(['role' => 'admin']);
        $request = Request::create('/test');
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserRole();
        $response = $middleware->handle($request, fn () => response('OK'), 'admin');

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_allows_any_of_multiple_roles()
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $request = Request::create('/test');
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserRole();
        $response = $middleware->handle($request, fn () => response('OK'), 'teacher', 'admin');

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_rejects_non_matching_role()
    {
        $user = User::factory()->create(['role' => 'student']);
        $request = Request::create('/test');
        $request->setUserResolver(fn () => $user);

        $middleware = new EnsureUserRole();

        $this->expectException(HttpException::class);
        $middleware->handle($request, fn () => response('OK'), 'admin');
    }

    public function test_rejects_unauthenticated_user()
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn () => null);

        $middleware = new EnsureUserRole();

        $this->expectException(HttpException::class);
        $middleware->handle($request, fn () => response('OK'), 'admin');
    }
}
