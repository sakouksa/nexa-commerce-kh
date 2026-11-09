<?php

namespace App\Services\Inventory;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Services\Telegram\TelegramService;
use Illuminate\Support\Facades\DB;

class StockService
{
    const DEFAULT_LOW = 5;

    const DEFAULT_HIGH = 50;

    public static function deductStockForOrder(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $summary = [];

            if (! $order->relationLoaded('items')) {
                $order->load('items');
            }

            foreach ($order->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                if (! $product) {
                    continue;
                }

                $before = (int) ($product->quantity ?? 0);
                $newQty = max(0, $before - (int) $item->quantity);
                $product->quantity = $newQty;

                $entry = [
                    'name' => $product->name,
                    'deducted' => min($before, (int) $item->quantity),
                    'remaining' => $newQty,
                ];

                $orderedVars = $item->getVariationsDict();
                if (! empty($orderedVars)) {
                    $variations = $product->getVariationsArray();
                    if (! empty($variations)) {
                        foreach ($variations as &$v) {
                            $attrs = $v['attrs'] ?? [];
                            $match = true;
                            foreach ($orderedVars as $k => $val) {
                                if (! isset($attrs[$k]) || (string) $attrs[$k] !== (string) $val) {
                                    $match = false;
                                    break;
                                }
                            }
                            if ($match) {
                                $vQty = (int) ($v['quantity'] ?? 0);
                                $v['quantity'] = max(0, $vQty - (int) $item->quantity);
                                $varLabelParts = [];
                                foreach ($orderedVars as $k => $val) {
                                    $varLabelParts[] = "{$k}: {$val}";
                                }
                                $entry['variation'] = [
                                    'label' => implode(', ', $varLabelParts),
                                    'deducted' => min($vQty, (int) $item->quantity),
                                    'remaining' => $v['quantity'],
                                ];
                                break;
                            }
                        }
                        unset($v);
                        $product->variations = json_encode($variations, JSON_UNESCAPED_UNICODE);
                    }
                }

                $product->save();
                $summary[$product->id] = $entry;
            }

            return $summary;
        });
    }

    public static function restoreStockForOrder(Order $order): array
    {
        return DB::transaction(function () use ($order) {
            $summary = [];

            if (! $order->relationLoaded('items')) {
                $order->load('items');
            }

            foreach ($order->items as $item) {
                if (! $item->product_id) {
                    continue;
                }

                $product = Product::where('id', $item->product_id)->lockForUpdate()->first();
                if (! $product) {
                    continue;
                }

                $before = (int) ($product->quantity ?? 0);
                $newQty = $before + (int) $item->quantity;
                $product->quantity = $newQty;

                $entry = [
                    'name' => $product->name,
                    'restored' => (int) $item->quantity,
                    'remaining' => $newQty,
                ];

                $orderedVars = $item->getVariationsDict();
                if (! empty($orderedVars)) {
                    $variations = $product->getVariationsArray();
                    if (! empty($variations)) {
                        foreach ($variations as &$v) {
                            $attrs = $v['attrs'] ?? [];
                            $match = true;
                            foreach ($orderedVars as $k => $val) {
                                if (! isset($attrs[$k]) || (string) $attrs[$k] !== (string) $val) {
                                    $match = false;
                                    break;
                                }
                            }
                            if ($match) {
                                $vQty = (int) ($v['quantity'] ?? 0);
                                $v['quantity'] = $vQty + (int) $item->quantity;
                                $varLabelParts = [];
                                foreach ($orderedVars as $k => $val) {
                                    $varLabelParts[] = "{$k}: {$val}";
                                }
                                $entry['variation'] = [
                                    'label' => implode(', ', $varLabelParts),
                                    'restored' => (int) $item->quantity,
                                    'remaining' => $v['quantity'],
                                ];
                                break;
                            }
                        }
                        unset($v);
                        $product->variations = json_encode($variations, JSON_UNESCAPED_UNICODE);
                    }
                }

                $product->save();
                $summary[$product->id] = $entry;
            }

            return $summary;
        });
    }

    public static function getStockReport(int $shopId, int $low = self::DEFAULT_LOW, int $high = self::DEFAULT_HIGH): array
    {
        $products = Product::where('shop_id', $shopId)->get();
        $groups = [
            'out_of_stock' => [],
            'low_stock' => [],
            'normal' => [],
            'high_stock' => [],
        ];

        foreach ($products as $p) {
            $qty = (int) ($p->quantity ?? 0);
            $item = $p->to_dict();

            if ($qty <= 0) {
                $groups['out_of_stock'][] = $item;
            } elseif ($qty <= $low) {
                $groups['low_stock'][] = $item;
            } elseif ($qty >= $high) {
                $groups['high_stock'][] = $item;
            } else {
                $groups['normal'][] = $item;
            }
        }

        return [
            'shop_id' => $shopId,
            'low_threshold' => $low,
            'high_threshold' => $high,
            'total_products' => $products->count(),
            'counts' => [
                'out_of_stock' => count($groups['out_of_stock']),
                'low_stock' => count($groups['low_stock']),
                'normal' => count($groups['normal']),
                'high_stock' => count($groups['high_stock']),
            ],
            'groups' => $groups,
        ];
    }

    public static function collectLowStockItems(Shop $shop, int $low = self::DEFAULT_LOW): array
    {
        $items = [];
        $products = Product::where('shop_id', $shop->id)->get();
        foreach ($products as $p) {
            $qty = (int) ($p->quantity ?? 0);
            if ($qty <= $low) {
                $items[] = ['name' => $p->name, 'quantity' => $qty];
            }
        }

        return $items;
    }

    public static function sendLowStockAlerts(Shop $shop, int $low = self::DEFAULT_LOW): bool
    {
        $lowItems = self::collectLowStockItems($shop, $low);
        if (empty($lowItems)) {
            return false;
        }

        $lines = [
            '⚠️ <b>ការជូនដំណឹងអំពីស្តុកទំនិញ (Low Stock Alert)</b>',
            '',
            '🏪 <b>ហាង:</b> '.($shop->shop_name ?: $shop->username),
            '',
        ];

        foreach ($lowItems as $item) {
            $status = $item['quantity'] <= 0 ? '❌ អស់ពីស្តុក (0)' : "⚠️ នៅសល់តិច ({$item['quantity']})";
            $lines[] = "• {$item['name']}: {$status}";
        }

        return TelegramService::sendShopNotification($shop, implode("\n", $lines));
    }

    public static function checkAvailability(int $productId, int $quantity): bool
    {
        $product = Product::find($productId);
        if (! $product) {
            return false;
        }

        return (int) $product->quantity >= $quantity;
    }

    public static function getLowStockProducts(Shop $shop, int $threshold = self::DEFAULT_LOW): array
    {
        $products = Product::where('shop_id', $shop->id)
            ->where('quantity', '<=', $threshold)
            ->get();

        return $products->map(fn ($p) => $p->to_dict())->toArray();
    }
}
