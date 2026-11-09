<?php

namespace App\Services\Documents;

use App\Models\Order;
use App\Models\Shop;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class PdfReceiptService
{
    /**
     * Find a usable Chrome/Chromium executable path.
     */
    public static function findChromeBinary(): ?string
    {
        $custom = env('CHROME_PATH');
        if ($custom && file_exists($custom) && is_executable($custom)) {
            return $custom;
        }

        $candidates = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/snap/bin/chromium',
        ];

        foreach ($candidates as $path) {
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }

        // Try 'which' command
        $whichCommands = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];
        foreach ($whichCommands as $cmd) {
            $output = trim((string) @shell_exec("which {$cmd} 2>/dev/null"));
            if ($output && file_exists($output) && is_executable($output)) {
                return $output;
            }
        }

        return null;
    }

    /**
     * Clean presentation data preparation for the receipt view.
     */
    public static function prepareReceiptData(Order $order, Shop $shop, array $rawItems, string $lang): array
    {
        $isKm = in_array(strtolower($lang), ['kh', 'km']);
        $locale = $isKm ? 'kh' : 'en';
        app()->setLocale($locale);

        $shopName = $shop->shop_name ?: ($shop->username ?: 'MiniStore KH');

        // Safe tagline, address, contact avoiding demo placeholder leak
        if ($isKm) {
            $tagline = ($shop->bio && ! str_contains($shop->bio, 'neighbourhood') && ! str_contains($shop->bio, 'platform'))
                ? $shop->bio
                : __('receipts.taglineDefault');
            $address = ($shop->address && ! str_contains($shop->address, 'Welcome to our demo store') && ! str_contains($shop->address, 'demo'))
                ? $shop->address
                : __('receipts.defaultAddress');
            $contact = ($shop->contact && ! str_contains($shop->contact, 'Telegram:') && ! str_contains($shop->contact, 'Phnom Penh'))
                ? $shop->contact
                : '+855 (0) 23 999 888';
            $walkInName = __('receipts.walkInCustomer');
        } else {
            $tagline = ($shop->bio && ! str_contains($shop->bio, 'ប្រព័ន្ធ') && ! str_contains($shop->bio, 'neighbourhood') && ! str_contains($shop->bio, 'platform'))
                ? $shop->bio
                : __('receipts.taglineDefault');
            $address = ($shop->address && ! str_contains($shop->address, 'រាជធានីភ្នំពេញ') && ! str_contains($shop->address, 'Welcome') && ! str_contains($shop->address, 'demo'))
                ? $shop->address
                : __('receipts.defaultAddress');
            $contact = ($shop->contact && ! str_contains($shop->contact, 'រាជធានីភ្នំពេញ') && ! str_contains($shop->contact, 'Telegram:') && ! str_contains($shop->contact, 'Phnom Penh'))
                ? $shop->contact
                : '+855 (0) 23 999 888';
            $walkInName = __('receipts.walkInCustomer');
        }

        $email = ($shop->username ?: 'demo').'@ministorekh.com';

        // Logo base64 data URI
        $logoDataUri = '';
        $shopLogoPath = '';
        if (! empty($shop->logo)) {
            $candidate = public_path(ltrim($shop->logo, '/'));
            if (file_exists($candidate)) {
                $shopLogoPath = $candidate;
            }
        }
        if (! $shopLogoPath && file_exists(public_path('logo.png'))) {
            $shopLogoPath = public_path('logo.png');
        }
        if ($shopLogoPath && file_exists($shopLogoPath)) {
            $mime = mime_content_type($shopLogoPath) ?: 'image/png';
            $logoDataUri = 'data:'.$mime.';base64,'.base64_encode(file_get_contents($shopLogoPath));
        }
        $shopInitial = strtoupper(substr($shopName, 0, 1) ?: 'M');

        // Date formatter with locale
        $khMonths = [
            '01' => 'មករា', '02' => 'កុម្ភៈ', '03' => 'មីនា', '04' => 'មេសា',
            '05' => 'ឧសភា', '06' => 'មិថុនា', '07' => 'កក្កដា', '08' => 'សីហា',
            '09' => 'កញ្ញា', '10' => 'តុលា', '11' => 'វិច្ឆិកា', '12' => 'ធ្នូ',
        ];
        $formatDate = function ($d) use ($isKm, $khMonths) {
            if (! $d) {
                return '—';
            }
            $ts = $d instanceof \DateTimeInterface ? $d->getTimestamp() : strtotime($d);
            if (! $ts) {
                return '—';
            }
            $day = date('d', $ts);
            $year = date('Y', $ts);
            $time = date('H:i', $ts);
            if ($isKm) {
                $m = date('m', $ts);
                $monthName = $khMonths[$m] ?? $m;

                return "{$day} {$monthName} {$year} {$time}";
            }

            return date('d M Y H:i', $ts);
        };

        // Formatted order items
        $totalUnits = 0;
        $items = [];
        foreach ($rawItems as $idx => $it) {
            $qty = (int) ($it['quantity'] ?? 1);
            $totalUnits += $qty;
            $priceUsd = (float) ($it['price'] ?? 0);
            $lineTotalUsd = $priceUsd * $qty;
            $priceKhr = round($priceUsd * 4100);
            $lineTotalKhr = round($lineTotalUsd * 4100);

            $vars = $it['variations'] ?? [];
            $varLabel = '';
            if (is_array($vars) && ! empty($vars)) {
                $p = [];
                foreach ($vars as $k => $v) {
                    $p[] = "{$k}: {$v}";
                }
                $varLabel = implode(', ', $p);
            }

            $items[] = [
                'index' => $idx + 1,
                'name' => $it['product_name'] ?? __('receipts.productDefault'),
                'variation' => $varLabel,
                'quantity' => $qty,
                'price_usd' => number_format($priceUsd, 2),
                'price_khr' => number_format($priceKhr),
                'total_usd' => number_format($lineTotalUsd, 2),
                'total_khr' => number_format($lineTotalKhr),
            ];
        }

        // Financials
        $isKhr = strtoupper($order->currency ?: 'USD') === 'KHR';
        $rate = 4100;
        $orderTotalUsd = $isKhr ? ((float) $order->total / $rate) : (float) $order->total;
        $orderTotalKhr = $isKhr ? (float) $order->total : round($orderTotalUsd * $rate);
        $subtotalUsd = $isKhr ? ((float) $order->items_total / $rate) : (float) $order->items_total;
        $discountUsd = $isKhr ? ((float) $order->discount / $rate) : (float) $order->discount;
        $shippingUsd = $isKhr ? ((float) $order->shipping_fee / $rate) : (float) $order->shipping_fee;

        $orderNum = strtoupper($order->order_number ?: '');
        $channel = str_starts_with($orderNum, 'POS')
            ? __('receipts.channels.pos')
            : ($order->customer_telegram ? __('receipts.channels.telegram') : __('receipts.channels.storefront'));

        $payMethod = strtolower($order->payment_method ?: '') === 'cash'
            ? __('receipts.payments.cash')
            : __('receipts.payments.bank');

        $paidStatus = $order->payment_status === 'paid'
            ? __('receipts.paid')
            : __('receipts.pending');

        $st = strtolower($order->order_status ?: 'confirmed');
        $orderStatusText = __('receipts.statuses.'.$st) ?: ucfirst($st);

        $customerTelegram = $order->customer_telegram ? ('@'.ltrim($order->customer_telegram, '@')) : null;
        $customerAddress = $order->customer_address ? ($order->customer_address.($order->customer_city ? ', '.$order->customer_city : '')) : null;

        return [
            'isKm' => $isKm,
            'lang' => $lang,
            'shop' => $shop,
            'shopName' => $shopName,
            'shopInitial' => $shopInitial,
            'tagline' => $tagline,
            'address' => $address,
            'contact' => $contact,
            'email' => $email,
            'logoDataUri' => $logoDataUri,
            'order' => $order,
            'orderNumber' => $order->order_number,
            'orderDate' => $formatDate($order->paid_at ?: $order->created_at),
            'generatedDate' => $formatDate(now()),
            'paidStatus' => $paidStatus,
            'orderStatusText' => $orderStatusText,
            'channel' => $channel,
            'paymentMethod' => $payMethod,
            'customerName' => $order->customer_name ?: $walkInName,
            'customerPhone' => $order->customer_phone ?: '—',
            'customerTelegram' => $customerTelegram,
            'customerAddress' => $customerAddress ?: '—',
            'items' => $items,
            'totalItemsCount' => count($items),
            'totalUnits' => $totalUnits,
            'subtotalUsd' => number_format($subtotalUsd, 2),
            'discountUsd' => $discountUsd > 0 ? number_format($discountUsd, 2) : null,
            'shippingUsd' => $shippingUsd > 0 ? number_format($shippingUsd, 2) : null,
            'grandTotalUsd' => number_format($orderTotalUsd, 2),
            'grandTotalKhr' => number_format($orderTotalKhr),
            'khrPrefix' => __('receipts.currencyKhrPrefix'),
            'customerNote' => $order->customer_note ?: __('receipts.defaultReceiptNote'),
        ];
    }

    public static function generateReceipt(Order $order, ?Shop $shop = null, ?array $items = null, ?string $lang = null): string
    {
        $shop = $shop ?: $order->shop;
        if ($items === null) {
            if (! $order->relationLoaded('items')) {
                $order->load('items');
            }
            $items = $order->items ? $order->items->map(fn ($it) => is_array($it) ? $it : $it->toArray())->toArray() : [];
        }

        $dir = public_path('uploads/receipts');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $activeLang = $lang ?: request('lang', app()->getLocale() ?: 'kh');
        $normalizedLang = in_array(strtolower($activeLang), ['en', 'english']) ? 'en' : 'kh';

        // Set Laravel application locale explicitly
        app()->setLocale($normalizedLang);
        request()->merge(['lang' => $normalizedLang]);

        $filename = "receipt_{$order->id}_{$normalizedLang}.pdf";
        $filepath = "{$dir}/{$filename}";
        $legacyFilepath = "{$dir}/receipt_{$order->id}.pdf";

        // Remove old cache file to ensure freshly rendered design
        if (file_exists($filepath)) {
            @unlink($filepath);
        }

        $viewData = self::prepareReceiptData($order, $shop, $items, $normalizedLang);

        $chromeBinary = self::findChromeBinary();
        $renderedSuccessfully = false;

        if ($chromeBinary) {
            $tempHtml = storage_path('app/temp_receipt_'.$order->id.'_'.uniqid().'.html');
            try {
                $html = view('receipt', $viewData)->render();
                File::put($tempHtml, $html);

                $cmd = escapeshellarg($chromeBinary)
                    .' --headless --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw --print-to-pdf='
                    .escapeshellarg($filepath).' '
                    .escapeshellarg('file://'.$tempHtml).' 2>&1';

                exec($cmd, $out, $ret);

                if (file_exists($filepath) && filesize($filepath) > 1000) {
                    $renderedSuccessfully = true;
                    @copy($filepath, $legacyFilepath);
                }
            } catch (\Throwable $e) {
                Log::warning('Chrome PDF generation failed, falling back to DomPDF: '.$e->getMessage());
            } finally {
                if (file_exists($tempHtml)) {
                    @unlink($tempHtml);
                }
            }
        }

        // Fallback to DomPDF if Chrome is not installed or execution failed
        if (! $renderedSuccessfully) {
            $pdf = Pdf::loadView('receipt', $viewData)->setPaper('a4', 'portrait');
            $pdf->save($filepath);
            @copy($filepath, $legacyFilepath);
        }

        return "/uploads/receipts/{$filename}";
    }

    public static function generate(Order $order): string
    {
        return self::generateReceipt($order);
    }
}
