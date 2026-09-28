<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'integer', 'min:0'],
            'images' => ['nullable'],
            'custom_attributes' => ['nullable'],
            'variations' => ['nullable'],
            'metadata' => ['nullable'],
            'featured' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string'],
        ];
    }
}
