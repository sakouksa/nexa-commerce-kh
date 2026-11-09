<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        return response()->json([
            'total_shops' => Shop::count(),
            'active_shops' => Shop::where('status', 'active')->count(),
            'total_users' => User::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_customers' => Customer::count(),
            'paid_orders_revenue' => (float) Order::where('payment_status', 'paid')->sum('total'),
        ]);
    }
}
