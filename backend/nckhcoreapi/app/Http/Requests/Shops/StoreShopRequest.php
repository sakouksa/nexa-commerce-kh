<?php

namespace App\Http\Requests\Shops;

use Illuminate\Foundation\Http\FormRequest;

class StoreShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:2', 'max:50'],
            'shop_name' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:4'],
            'email' => ['nullable', 'string', 'max:255'],
            'currency' => ['nullable', 'string', 'max:10'],
        ];
    }
}
