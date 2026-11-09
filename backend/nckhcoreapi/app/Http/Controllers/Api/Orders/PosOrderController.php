<?php

namespace App\Http\Controllers\Api\Orders;

use App\Actions\Orders\ProcessPosOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\PosOrderRequest;
use App\Http\Resources\OrderResource;

class PosOrderController extends Controller
{
    public function store(PosOrderRequest $request, ProcessPosOrderAction $action)
    {
        $order = $action->execute($request->validated(), $request->user());

        return response()->json((new OrderResource($order))->resolve());
    }
}
