<!DOCTYPE html>
<html lang="{{ $isKm ? 'km' : 'en' }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('receipts.officialReceiptTitle') }} #{{ $orderNumber }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: a4 portrait;
            margin: 8mm 10mm;
        }

        @font-face {
            font-family: 'Kantumruy Pro';
            src: url('{{ public_path('fonts/KantumruyPro-Regular.ttf') }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        @font-face {
            font-family: 'Kantumruy Pro';
            src: url('{{ public_path('fonts/KantumruyPro-Bold.ttf') }}') format('truetype');
            font-weight: bold;
            font-style: normal;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 10.5px;
            color: #0f172a;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }

        table {
            border-collapse: collapse;
        }

        .table-layout {
            width: 100%;
            border-collapse: collapse;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .uppercase { text-transform: uppercase; }
        .text-slate-400 { color: #94a3b8; }
        .text-slate-500 { color: #64748b; }
        .text-slate-600 { color: #475569; }
        .text-slate-700 { color: #334155; }
        .text-slate-900 { color: #0f172a; }

        /* ─── Header Section ─── */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .company-name {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.2px;
            margin: 0 0 2px 0;
        }
        .company-tagline {
            font-size: 9.5px;
            color: #64748b;
            margin: 0 0 4px 0;
            line-height: 1.35;
        }
        .company-contact {
            font-size: 8.5px;
            color: #64748b;
            line-height: 1.4;
        }
        .doc-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
        }
        .meta-line {
            font-size: 9px;
            line-height: 1.5;
            color: #475569;
        }
        .order-badge-number {
            font-family: 'Inter', monospace, sans-serif;
            font-size: 9.5px;
            font-weight: 700;
            color: #0f172a;
        }
        .status-badge-paid {
            display: inline-block;
            padding: 2.5px 8px;
            border-radius: 9999px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            background-color: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
            letter-spacing: 0.3px;
        }
        .status-badge-pending {
            display: inline-block;
            padding: 2.5px 8px;
            border-radius: 9999px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            background-color: #fffbeb;
            color: #d97706;
            border: 1px solid #fde68a;
            letter-spacing: 0.3px;
        }

        /* ─── 2-Column Info Cards ─── */
        .info-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background-color: #f8fafc;
            padding: 9px 12px;
            font-size: 9px;
        }
        .info-card-header {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 6px;
        }
        .info-card-title {
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #334155;
            letter-spacing: 0.4px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 2.5px 0;
            font-size: 9px;
            vertical-align: middle;
        }
        .info-label {
            color: #64748b;
            width: 36%;
        }
        .info-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
            width: 64%;
        }

        /* ─── Items Table ─── */
        .items-section-header {
            width: 100%;
            margin: 14px 0 6px 0;
        }
        .items-section-title {
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #1e293b;
            letter-spacing: 0.4px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .items-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-size: 8.5px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            letter-spacing: 0.3px;
        }
        .items-table td {
            padding: 7px 10px;
            font-size: 9.5px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .items-table tr.even-row {
            background-color: #fbfcfd;
        }
        .item-name {
            font-weight: 600;
            color: #0f172a;
            font-size: 9.5px;
        }
        .item-sku {
            font-size: 8px;
            color: #64748b;
            margin-top: 2px;
        }
        .dual-currency-sub {
            font-size: 8px;
            color: #64748b;
            margin-top: 1px;
            font-family: 'Kantumruy Pro', 'Inter', sans-serif;
        }

        /* ─── Breakdown & Notes ─── */
        .breakdown-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background-color: #f8fafc;
            padding: 9px 12px;
        }
        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
        }
        .breakdown-table td {
            padding: 2.5px 0;
            font-size: 9.5px;
        }
        .grand-total-row td {
            border-top: 1.5px solid #cbd5e1;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
        }
        .paid-due-box {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 5px 8px;
            margin-top: 6px;
        }

        /* ─── Thank You & Footer ─── */
        .system-watermark {
            width: 100%;
            border-top: 1px dashed #cbd5e1;
            margin-top: 14px;
            padding-top: 8px;
            font-size: 8px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <!-- ─── 1. Header Section ─── -->
    <table class="header-table">
        <tr>
            <!-- Left: Company / Store Letterhead -->
            <td style="width: 58%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 52px; vertical-align: top; padding-right: 12px;">
                            @if(!empty($logoDataUri))
                                <div style="width: 50px; height: 50px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; text-align: center; vertical-align: middle; line-height: 46px; overflow: hidden;">
                                    <img src="{{ $logoDataUri }}" style="max-width: 46px; max-height: 46px; vertical-align: middle; display: inline-block;" alt="Logo" />
                                </div>
                            @else
                                <div style="width: 50px; height: 50px; border-radius: 8px; background-color: #0f172a; color: #ffffff; text-align: center; line-height: 50px; font-size: 22px; font-weight: bold;">
                                    {{ $shopInitial }}
                                </div>
                            @endif
                        </td>
                        <td style="vertical-align: top;">
                            <div class="company-name">{{ $shopName }}</div>
                            <div class="company-tagline">{{ $tagline }}</div>
                            <div class="company-contact">
                                <span class="text-slate-500 font-semibold">{{ __('receipts.address') }}</span> {{ $address }}<br>
                                <span class="text-slate-500 font-semibold">{{ __('receipts.phone') }}</span> {{ $contact }} &nbsp;•&nbsp; <span class="text-slate-500 font-semibold">{{ __('receipts.emailLabel') }}</span> {{ $email }}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>

            <!-- Right: Official Document Title & Details -->
            <td style="width: 42%; vertical-align: top;" class="text-right">
                <div class="doc-title">{{ __('receipts.officialReceiptTitle') }}</div>
                <div class="meta-line">
                    <span class="text-slate-500 uppercase">{{ __('receipts.receiptNo') }}</span>
                    <strong class="order-badge-number">#{{ $orderNumber }}</strong>
                </div>
                <div class="meta-line">
                    <span class="text-slate-500 uppercase">{{ __('receipts.dateCol') }}</span>
                    <span>{{ $orderDate }}</span>
                </div>
                <div class="meta-line" style="margin-top: 3px;">
                    <span class="text-slate-500 uppercase">{{ __('receipts.paymentStatus') }}</span>
                    <span class="{{ $order->payment_status === 'paid' ? 'status-badge-paid' : 'status-badge-pending' }}">{{ $paidStatus }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- ─── 2. Metadata 2-Column Cards ─── -->
    <table class="table-layout" style="margin-bottom: 10px;">
        <tr>
            <!-- Customer Information Card -->
            <td style="width: 49%; vertical-align: top; padding-right: 5px;">
                <div class="info-card">
                    <table class="table-layout info-card-header">
                        <tr>
                            <td class="info-card-title">{{ __('receipts.customerInfo') }}</td>
                            <td class="text-right text-slate-500" style="font-size: 8px;">{{ $channel }}</td>
                        </tr>
                    </table>
                    <table class="info-table">
                        <tr>
                            <td class="info-label">{{ __('receipts.customer') }}</td>
                            <td class="info-value">{{ $customerName }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">{{ __('receipts.phone') }}</td>
                            <td class="info-value">{{ $customerPhone }}</td>
                        </tr>
                        @if($customerTelegram)
                        <tr>
                            <td class="info-label">{{ __('receipts.telegram') }}</td>
                            <td class="info-value">{{ $customerTelegram }}</td>
                        </tr>
                        @endif
                        <tr>
                            <td class="info-label">{{ __('receipts.address') }}</td>
                            <td class="info-value">{{ $customerAddress }}</td>
                        </tr>
                    </table>
                </div>
            </td>

            <!-- Transaction Details Card -->
            <td style="width: 49%; vertical-align: top; padding-left: 5px;">
                <div class="info-card">
                    <table class="table-layout info-card-header">
                        <tr>
                            <td class="info-card-title">{{ __('receipts.transactionDetails') }}</td>
                            <td class="text-right text-slate-500" style="font-size: 8px;">
                                <span class="{{ $order->payment_status === 'paid' ? 'status-badge-paid' : 'status-badge-pending' }}">{{ $paidStatus }}</span>
                            </td>
                        </tr>
                    </table>
                    <table class="info-table">
                        <tr>
                            <td class="info-label">{{ __('receipts.paymentMethod') }}</td>
                            <td class="info-value">{{ $paymentMethod }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">{{ __('receipts.orderNumber') }}</td>
                            <td class="info-value font-mono">#{{ $orderNumber }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">{{ __('receipts.salesChannel') }}</td>
                            <td class="info-value">{{ $channel }}</td>
                        </tr>
                        <tr>
                            <td class="info-label">{{ __('receipts.orderStatus') }}</td>
                            <td class="info-value">{{ $orderStatusText }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- ─── 3. Ordered Items Breakdown Table ─── -->
    <table class="table-layout items-section-header">
        <tr>
            <td class="items-section-title">{{ __('receipts.orderedItemsBreakdown') }}</td>
            <td class="items-section-title text-right text-slate-500" style="font-size: 8.5px; font-weight: normal;">
                {{ $totalItemsCount }} {{ __('receipts.itemsCount') }} ({{ $totalUnits }} {{ __('receipts.unitsCount') }})
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">#</th>
                <th style="width: 47%; text-align: left;">{{ __('receipts.productDescription') }}</th>
                <th style="width: 10%; text-align: center;">{{ __('receipts.quantity') }}</th>
                <th style="width: 14%; text-align: right;">{{ __('receipts.unitPrice') }}</th>
                <th style="width: 9%; text-align: right;">{{ __('receipts.discount') }}</th>
                <th style="width: 15%; text-align: right;">{{ __('receipts.lineTotal') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
                <tr class="{{ $loop->even ? 'even-row' : '' }}">
                    <td style="text-align: center; color: #64748b; font-size: 8.5px;">{{ $item['index'] }}</td>
                    <td>
                        <div class="item-name">{{ $item['name'] }}</div>
                        @if($item['variation'])
                            <div class="item-sku">{{ $item['variation'] }}</div>
                        @endif
                    </td>
                    <td style="text-align: center; font-weight: 600; font-size: 9.5px;">{{ $item['quantity'] }}</td>
                    <td class="text-right">
                        <div class="font-semibold">${{ $item['price_usd'] }}</div>
                        <div class="dual-currency-sub">{{ $khrPrefix }}{{ $item['price_khr'] }}</div>
                    </td>
                    <td class="text-right" style="color: #94a3b8; font-size: 9px;">—</td>
                    <td class="text-right">
                        <div class="font-bold text-slate-900">${{ $item['total_usd'] }}</div>
                        <div class="dual-currency-sub">{{ $khrPrefix }}{{ $item['total_khr'] }}</div>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 14px; color: #94a3b8; font-style: italic;">
                        {{ __('receipts.noItems') }}
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- ─── 4. Totals & Notes Section ─── -->
    <table class="table-layout" style="margin-top: 10px;">
        <tr>
            <!-- Left: Notes Card -->
            <td style="width: 48%; vertical-align: top; padding-right: 6px;">
                <div class="info-card" style="min-height: 95px;">
                    <div style="font-size: 8px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; letter-spacing: 0.3px;">
                        {{ __('receipts.notesTerms') }}
                    </div>
                    <div style="font-size: 8.5px; color: #475569; line-height: 1.5;">
                        {{ $customerNote ?: __('receipts.noNotes') }}
                    </div>
                </div>
            </td>

            <!-- Right: Financial Breakdown -->
            <td style="width: 52%; vertical-align: top; padding-left: 6px;">
                <div class="breakdown-card">
                    <table class="breakdown-table">
                        <tr>
                            <td class="text-slate-600">{{ __('receipts.subtotal') }}</td>
                            <td class="text-right"><strong class="text-slate-900">${{ $subtotalUsd }}</strong></td>
                        </tr>
                        @if($discountUsd)
                        <tr>
                            <td class="text-slate-600">{{ __('receipts.discount') }}</td>
                            <td class="text-right" style="color: #e11d48; font-weight: 600;">-${{ $discountUsd }}</td>
                        </tr>
                        @endif
                        @if($shippingUsd)
                        <tr>
                            <td class="text-slate-600">{{ __('receipts.shipping') }}</td>
                            <td class="text-right text-slate-700">+${{ $shippingUsd }}</td>
                        </tr>
                        @endif
                        <tr class="grand-total-row">
                            <td class="uppercase" style="vertical-align: middle;">{{ __('receipts.grandTotal') }}</td>
                            <td class="text-right">
                                <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">${{ $grandTotalUsd }}</div>
                                <div style="font-size: 8.5px; color: #64748b; font-weight: normal; margin-top: 1px;">{{ $khrPrefix }}{{ $grandTotalKhr }}</div>
                            </td>
                        </tr>
                    </table>

                    <table class="table-layout paid-due-box">
                        <tr>
                            <td style="width: 50%;">
                                <span style="font-size: 7.5px; text-transform: uppercase; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.2px;">{{ __('receipts.paidAmount') }}</span>
                                <strong style="font-size: 10.5px; color: #059669;">${{ $grandTotalUsd }}</strong>
                            </td>
                            <td style="width: 50%; text-align: right;">
                                <span style="font-size: 7.5px; text-transform: uppercase; color: #64748b; font-weight: 600; display: block; letter-spacing: 0.2px;">{{ __('receipts.balanceDue') }}</span>
                                <strong style="font-size: 10.5px; color: #0f172a;">$0.00</strong>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- ─── 5. Footer: Thank You + Watermark ─── -->
    <table class="table-layout system-watermark">
        <tr>
            <td style="width: 55%; vertical-align: middle;">
                <span style="font-size: 9px; font-weight: 700; color: #0f172a;">♥ {{ __('receipts.thankYouTitle') }}</span>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">{{ __('receipts.thankYouSubtitle') }}</div>
            </td>
            <td style="width: 45%; text-align: right; font-size: 7.5px; color: #94a3b8; vertical-align: middle;">
                {{ __('receipts.auditWatermark') }}<br>
                {{ __('receipts.printedOn') }} {{ $generatedDate }}
            </td>
        </tr>
    </table>
</body>
</html>
