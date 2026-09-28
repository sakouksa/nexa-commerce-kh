<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <title>Receipt #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            color: #4f46e5;
            font-size: 20px;
        }
        .meta-table, .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .meta-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .items-table th {
            background-color: #f3f4f6;
            border-bottom: 2px solid #e5e7eb;
            padding: 8px;
            text-align: left;
        }
        .items-table td {
            border-bottom: 1px solid #e5e7eb;
            padding: 8px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-section {
            width: 50%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .total-section td {
            padding: 6px 8px;
        }
        .grand-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #4f46e5;
            color: #4f46e5;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px dashed #d1d5db;
            padding-top: 15px;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #d1fae5;
            color: #065f46;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $shop->shop_name ?: $shop->username }}</h1>
        <div>{{ $shop->contact ?: 'Receipt / វិក្កយបត្រ' }}</div>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 55%;">
                <strong>វិក្កយបត្រជូនចំពោះ (Bill To):</strong><br>
                {{ $order->customer_name ?: 'Valued Customer' }}<br>
                @if($order->customer_phone) ទូរស័ព្ទ: {{ $order->customer_phone }}<br> @endif
                @if($order->customer_address) អាសយដ្ឋាន: {{ $order->customer_address }}, {{ $order->customer_city }}<br> @endif
            </td>
            <td style="width: 45%; text-align: right;">
                <strong>លេខបញ្ជាទិញ (Order #):</strong> {{ $order->order_number }}<br>
                <strong>កាលបរិច្ឆេទ (Date):</strong> {{ $order->paid_at ? $order->paid_at->format('Y-m-d H:i') : ($order->created_at ? $order->created_at->format('Y-m-d H:i') : date('Y-m-d')) }}<br>
                <strong>ស្ថានភាព (Status):</strong> <span class="status-badge">{{ strtoupper($order->payment_status) }}</span><br>
                <strong>ការទូទាត់ (Method):</strong> {{ strtoupper($order->payment_method) }}<br>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 50%;">មុខទំនិញ (Item)</th>
                <th class="text-center" style="width: 15%;">ចំនួន (Qty)</th>
                <th class="text-right" style="width: 15%;">តម្លៃ (Price)</th>
                <th class="text-right" style="width: 15%;">សរុប (Total)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $idx => $item)
                @php
                    $lineTotal = (float)($item['price'] ?? 0) * (int)($item['quantity'] ?? 1);
                    $vars = $item['variations'] ?? [];
                    $varLabel = '';
                    if (is_array($vars) && !empty($vars)) {
                        $p = [];
                        foreach ($vars as $k => $v) { $p[] = "{$k}: {$v}"; }
                        $varLabel = ' (' . implode(', ', $p) . ')';
                    }
                @endphp
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td>{{ $item['product_name'] ?? 'Product' }}{{ $varLabel }}</td>
                    <td class="text-center">{{ $item['quantity'] ?? 1 }}</td>
                    <td class="text-right">${{ number_format((float)($item['price'] ?? 0), 2) }}</td>
                    <td class="text-right">${{ number_format($lineTotal, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="total-section">
        <tr>
            <td>សរុបទំនិញ (Subtotal):</td>
            <td class="text-right">${{ number_format((float)$order->items_total, 2) }}</td>
        </tr>
        @if((float)$order->shipping_fee > 0)
        <tr>
            <td>ថ្លៃដឹកជញ្ជូន (Shipping):</td>
            <td class="text-right">${{ number_format((float)$order->shipping_fee, 2) }}</td>
        </tr>
        @endif
        @if((float)$order->discount > 0)
        <tr>
            <td>បញ្ចុះតម្លៃ (Discount):</td>
            <td class="text-right">-${{ number_format((float)$order->discount, 2) }}</td>
        </tr>
        @endif
        <tr class="grand-total">
            <td>សរុបរួម (Grand Total):</td>
            <td class="text-right">${{ number_format((float)$order->total, 2) }} {{ $order->currency }}</td>
        </tr>
    </table>

    <div class="footer">
        អរគុណសម្រាប់ការគាំទ្រហាងរបស់យើងខ្ញុំ! Thank you for your purchase!
    </div>
</body>
</html>
