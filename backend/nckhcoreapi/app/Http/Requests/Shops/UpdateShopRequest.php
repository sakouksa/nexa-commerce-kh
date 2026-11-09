<?php

namespace App\Http\Requests\Shops;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shop_name' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50'],
            'logo' => ['nullable', 'string', 'max:500'],
            'banner' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'currency' => ['nullable', 'string', 'max:10'],
            'contact' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'slideshow' => ['nullable'],
            'social_media' => ['nullable'],
            'theme' => ['nullable'],
            'aba_settings' => ['nullable'],
            'telegram_settings' => ['nullable'],
        ];
    }
}
