<?php

namespace Tests\Unit\Actions\Telegram;

use App\Actions\Telegram\HandleMenuAction;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HandleMenuActionTest extends TestCase
{
    public function test_handle_menu_action_displays_product_list(): void
    {
        Http::fake([
            '*/api/products/public*' => Http::response([
                'data' => [
                    ['id' => 10, 'title' => 'Iced Latte', 'price' => 2.50, 'stock' => 10],
                    ['id' => 11, 'title' => 'Croissant', 'price' => 1.75, 'stock' => 3],
                ],
            ], 200),
            'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => ['message_id' => 3]], 200),
        ]);

        $action = app(HandleMenuAction::class);
        $shop = ['id' => 1, 'shop_name' => 'Coffee Corner', 'username' => 'coffeecorner'];

        $result = $action->execute(123456, $shop, 'mock_token');

        $this->assertTrue($result);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage')
                && str_contains($request['text'], 'Iced Latte')
                && str_contains($request['text'], 'Croissant');
        });
    }
}
