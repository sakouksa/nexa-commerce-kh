<?php

namespace App\Actions\Auth;

use App\Models\User;

class LogoutAction
{
    public function execute(?User $user): bool
    {
        // JWT tokens can be invalidated or client drops the token
        return true;
    }
}
