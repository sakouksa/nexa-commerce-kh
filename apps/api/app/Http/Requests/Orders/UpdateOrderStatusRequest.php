<?php

namespace App\Http\Requests\Orders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_status' => ['nullable', 'string', Rule::in(OrderStatus::values())],
            'payment_status' => ['nullable', 'string', Rule::in(PaymentStatus::values())],
        ];
    }
}
