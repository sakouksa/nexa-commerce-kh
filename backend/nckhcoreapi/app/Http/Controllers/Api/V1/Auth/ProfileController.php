<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            $customer = $request->attributes->get('customer');
            if ($customer) {
                return response()->json($customer->to_dict());
            }
            throw new HttpException(401, 'Unauthorized');
        }

        return response()->json($user->to_dict());
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            throw new HttpException(401, 'Unauthorized');
        }

        $fields = ['full_name', 'email'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $user->{$field} = $request->input($field);
            }
        }
        $user->save();

        return response()->json($user->to_dict());
    }
}
