<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::latest()->get();

        return response()->json($users->map(fn ($u) => $u->to_dict())->toArray());
    }

    public function show(int $userId): JsonResponse
    {
        $user = User::find($userId);
        if (! $user) {
            throw new HttpException(404, 'User not found');
        }

        return response()->json($user->to_dict());
    }

    public function destroy(int $userId): JsonResponse
    {
        $user = User::find($userId);
        if (! $user) {
            throw new HttpException(404, 'User not found');
        }

        $user->delete();

        return response()->json(['detail' => 'User deleted successfully']);
    }
}
