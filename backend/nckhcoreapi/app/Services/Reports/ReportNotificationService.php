<?php

namespace App\Services\Reports;

use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shop;
use App\Services\Inventory\StockService;
use App\Services\Telegram\TelegramService;
use Carbon\Carbon;

class ReportNotificationService
{
    /**
     * Generate business report summary in plain text, HTML, and structured metrics.
     */
    public static function generateSummary(Shop $shop, int $days = 1, string $lang = 'kh'): array
    {
        $isKh = $lang === 'kh';
        $shopName = $shop->shop_name ?: $shop->username;

        $t = fn (string $key, array $replace = []) => __("reports.{$key}", $replace, $lang);

        // Date calculation
        $now = Carbon::now();
        if ($days === 1) {
            $start = Carbon::today()->startOfDay();
            $end = Carbon::today()->endOfDay();
            $prevStart = Carbon::yesterday()->startOfDay();
            $prevEnd = Carbon::yesterday()->endOfDay();
            $periodLabel = $t('today');
        } else {
            $start = (clone $now)->subDays($days);
            $end = $now;
            $prevStart = (clone $now)->subDays($days * 2);
            $prevEnd = (clone $now)->subDays($days);
            $periodLabel = $t('past_days', ['count' => $days]);
        }

        $dateStr = $isKh
            ? $start->locale('km')->isoFormat('D MMMM YYYY')
            : $start->format('M d, Y');

        // Paid Orders
        $paidOrders = Order::where('shop_id', $shop->id)
            ->whereBetween('created_at', [$start, $end])
            ->where('payment_status', 'paid')
            ->get();

        $totalRevenue = (float) $paidOrders->sum('total');
        $totalOrders = $paidOrders->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0.0;
        $estimatedCost = $totalRevenue * 0.58;
        $estimatedProfit = max(0.0, $totalRevenue - $estimatedCost);
        $profitMargin = $totalRevenue > 0 ? ($estimatedProfit / $totalRevenue) * 100 : 0.0;

        // Growth rate vs previous period
        $prevRevenue = (float) Order::where('shop_id', $shop->id)
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->where('payment_status', 'paid')
            ->sum('total');

        if ($prevRevenue > 0) {
            $revenueGrowth = (($totalRevenue - $prevRevenue) / $prevRevenue) * 100;
        } else {
            $revenueGrowth = $totalRevenue > 0 ? 100.0 : 0.0;
        }

        // Payment Breakdown
        $khqrCount = 0;
        $cashCount = 0;
        $otherCount = 0;
        foreach ($paidOrders as $o) {
            $method = strtolower($o->payment_method ?? '');
            if (str_contains($method, 'khqr') || str_contains($method, 'bakong') || str_contains($method, 'aba') || str_contains($method, 'qr')) {
                $khqrCount++;
            } elseif (str_contains($method, 'cash') || str_contains($method, 'cod')) {
                $cashCount++;
            } else {
                $otherCount++;
            }
        }
        $totalPaymentMethods = $khqrCount + $cashCount + $otherCount;
        $khqrPct = $totalPaymentMethods > 0 ? round(($khqrCount / $totalPaymentMethods) * 100) : 0;
        $cashPct = $totalPaymentMethods > 0 ? round(($cashCount / $totalPaymentMethods) * 100) : 0;

        // Top 3 Products
        $topProducts = OrderItem::whereHas('order', function ($q) use ($shop, $start, $end) {
            $q->where('shop_id', $shop->id)
                ->whereBetween('created_at', [$start, $end])
                ->where('payment_status', 'paid');
        })
            ->selectRaw('product_name, SUM(quantity) as units, SUM(price * quantity) as revenue')
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->take(3)
            ->get();

        $unitsUnit = $t('units_unit');
        $ordersUnit = $t('orders_unit');
        $noDataText = $t('no_data');

        $topProdPlainLines = [];
        $topProdHtmlLines = [];
        if ($topProducts->isNotEmpty()) {
            foreach ($topProducts as $i => $p) {
                $pRevenue = number_format((float) $p->revenue, 2);
                $pUnits = (int) $p->units;
                $idx = $i + 1;
                $topProdPlainLines[] = "   {$idx}. {$p->product_name} — {$pUnits} {$unitsUnit} (\${$pRevenue})";
                $topProdHtmlLines[] = "   {$idx}. <b>{$p->product_name}</b> — {$pUnits} {$unitsUnit} (\${$pRevenue})";
            }
        } else {
            $topProdPlainLines[] = "   {$noDataText}";
            $topProdHtmlLines[] = "   {$noDataText}";
        }

        // Stock summary
        $stockReport = StockService::getStockReport($shop->id);
        $outOfStock = $stockReport['counts']['out_of_stock'] ?? 0;
        $lowStock = $stockReport['counts']['low_stock'] ?? 0;
        $totalStock = $stockReport['total_products'] ?? 0;

        $stockSummaryText = $t('stock_health_summary', [
            'low' => $lowStock,
            'out' => $outOfStock,
            'total' => $totalStock,
        ]);

        // Top 3 VIP Customers
        $topCustomers = Customer::where('shop_id', $shop->id)
            ->orderByDesc('total_spent')
            ->take(3)
            ->get();

        $topCustPlainLines = [];
        $topCustHtmlLines = [];
        if ($topCustomers->isNotEmpty()) {
            foreach ($topCustomers as $i => $c) {
                $cSpent = number_format((float) $c->total_spent, 2);
                $cOrders = (int) ($c->order_count ?? 1);
                $cName = $c->name ?: $t('walk_in_customer');
                $idx = $i + 1;
                $topCustPlainLines[] = "   {$idx}. {$cName} — \${$cSpent} ({$cOrders} {$ordersUnit})";
                $topCustHtmlLines[] = "   {$idx}. <b>{$cName}</b> — \${$cSpent} ({$cOrders} {$ordersUnit})";
            }
        } else {
            $topCustPlainLines[] = "   {$noDataText}";
            $topCustHtmlLines[] = "   {$noDataText}";
        }

        // Cancelled / Voided Orders
        $cancelledCount = Order::where('shop_id', $shop->id)
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($q) {
                $q->whereIn('status', ['cancelled', 'voided', 'refunded', 'failed'])
                    ->orWhereIn('order_status', ['cancelled', 'voided']);
            })
            ->count();

        // Format strings
        $formattedRevenue = number_format($totalRevenue, 2);
        $formattedProfit = number_format($estimatedProfit, 2);
        $formattedAov = number_format($avgOrderValue, 2);
        $growthSign = $revenueGrowth >= 0 ? '+' : '';
        $formattedGrowth = $growthSign.number_format($revenueGrowth, 1).'%';
        $vsPrevText = $t('vs_prev_period');

        $title = $t('title');
        $revLabel = $t('total_revenue');
        $ordersLabel = $t('orders');
        $profitLabel = $t('profit_est');
        $payLabel = $t('payment_breakdown');
        $topProdTitle = $t('top_selling_products');
        $stockLabel = $t('stock_health');
        $vipLabel = $t('top_vip_customers');
        $voidLabel = $t('cancelled_orders');
        $branding = $t('branding');

        // Plain Text Template
        $plain = "📊 {$title} ({$shopName})\n".
                 "📅 {$dateStr} · {$periodLabel}\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "💰 {$revLabel}: \${$formattedRevenue}\n".
                 "🧾 {$ordersLabel}: {$totalOrders} | {$formattedGrowth} {$vsPrevText}\n".
                 "💵 {$profitLabel}: \${$formattedProfit} · Margin ".number_format($profitMargin, 1)."%\n".
                 "🎯 AOV: \${$formattedAov}\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "💳 {$payLabel}:\n".
                 "   📱 KHQR/Bakong: {$khqrPct}% ({$khqrCount} {$ordersUnit})\n".
                 "   💵 Cash: {$cashPct}% ({$cashCount} {$ordersUnit})\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "🏆 {$topProdTitle}:\n".
                 implode("\n", $topProdPlainLines)."\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "📦 {$stockLabel}:\n".
                 "   {$stockSummaryText}\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "👑 {$vipLabel}:\n".
                 implode("\n", $topCustPlainLines)."\n".
                 "━━━━━━━━━━━━━━━━━━\n".
                 "⚠️ {$voidLabel}: {$cancelledCount}\n".
                 "✨ {$branding}";

        // HTML Template (for Telegram)
        $html = "📊 <b>{$title} ({$shopName})</b>\n".
                "📅 {$dateStr} · {$periodLabel}\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "💰 <b>{$revLabel}:</b> \${$formattedRevenue}\n".
                "🧾 <b>{$ordersLabel}:</b> {$totalOrders} | {$formattedGrowth} {$vsPrevText}\n".
                "💵 <b>{$profitLabel}:</b> \${$formattedProfit} · Margin ".number_format($profitMargin, 1)."%\n".
                "🎯 <b>AOV:</b> \${$formattedAov}\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "💳 <b>{$payLabel}:</b>\n".
                "   📱 KHQR/Bakong: {$khqrPct}% ({$khqrCount} {$ordersUnit})\n".
                "   💵 Cash: {$cashPct}% ({$cashCount} {$ordersUnit})\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "🏆 <b>{$topProdTitle}:</b>\n".
                implode("\n", $topProdHtmlLines)."\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "📦 <b>{$stockLabel}:</b>\n".
                "   {$stockSummaryText}\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "👑 <b>{$vipLabel}:</b>\n".
                implode("\n", $topCustHtmlLines)."\n".
                "━━━━━━━━━━━━━━━━━━\n".
                "⚠️ <b>{$voidLabel}:</b> {$cancelledCount}\n".
                "✨ <i>{$branding}</i>";

        return [
            'shop_id' => $shop->id,
            'shop_name' => $shopName,
            'period_days' => $days,
            'language' => $lang,
            'plain_text' => $plain,
            'html' => $html,
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'estimated_cost' => $estimatedCost,
                'estimated_profit' => $estimatedProfit,
                'profit_margin_percent' => round($profitMargin, 1),
                'avg_order_value' => round($avgOrderValue, 2),
                'growth_rate' => round($revenueGrowth, 1),
                'khqr_count' => $khqrCount,
                'cash_count' => $cashCount,
                'out_of_stock_count' => $outOfStock,
                'low_stock_count' => $lowStock,
                'total_stock_count' => $totalStock,
                'cancelled_orders_count' => $cancelledCount,
            ],
        ];
    }

    /**
     * Dispatch the report directly to shop's configured Telegram bot / chats.
     */
    public static function dispatch(Shop $shop, int $days = 1, string $lang = 'kh'): array
    {
        $summary = self::generateSummary($shop, $days, $lang);
        $sent = TelegramService::sendShopNotification($shop, $summary['html']);

        if ($sent) {
            ActivityLog::create([
                'shop_id' => $shop->id,
                'user_id' => null,
                'username' => 'System',
                'action' => 'telegram_report_dispatched',
                'description' => "Dispatched {$days}-day business report to Telegram (Lang: {$lang})",
            ]);
        }

        return [
            'ok' => $sent,
            'summary' => $summary,
        ];
    }

    /**
     * Automated nightly EOD dispatch for all active shops with Telegram enabled.
     */
    public static function dispatchAllDailyEod(): array
    {
        $shops = Shop::all();
        $success = 0;
        $failed = 0;

        foreach ($shops as $shop) {
            $tg = $shop->telegram_dict();
            $enabled = ! empty($tg['enabled']);
            $token = trim($tg['bot_token'] ?? '');

            if ($enabled && ! empty($token)) {
                $res = self::dispatch($shop, 1, 'kh');
                if ($res['ok']) {
                    $success++;
                } else {
                    $failed++;
                }
            }
        }

        return [
            'total_processed' => $success + $failed,
            'success' => $success,
            'failed' => $failed,
        ];
    }
}
