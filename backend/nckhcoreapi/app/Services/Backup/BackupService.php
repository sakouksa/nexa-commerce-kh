<?php

namespace App\Services\Backup;

use App\Models\BackupHistory;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Shop;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use ZipArchive;

class BackupService
{
    public static function collectShopData(int $shopId): ?array
    {
        $shop = Shop::find($shopId);
        if (! $shop) {
            return null;
        }

        return [
            'version' => 1,
            'exported_at' => now()->toIso8601String(),
            'type' => 'shop',
            'shop' => $shop->to_dict(true),
            'categories' => Category::where('shop_id', $shopId)->get()->map(fn ($c) => $c->to_dict())->toArray(),
            'products' => Product::where('shop_id', $shopId)->get()->map(fn ($p) => $p->to_dict())->toArray(),
            'orders' => Order::with(['shop', 'items'])->where('shop_id', $shopId)->get()->map(fn ($o) => $o->to_dict(true))->toArray(),
            'customers' => Customer::where('shop_id', $shopId)->get()->map(fn ($c) => $c->to_dict())->toArray(),
            'settings' => Setting::where('shop_id', $shopId)->get()->map(fn ($s) => $s->to_dict())->toArray(),
        ];
    }

    public static function collectSystemData(): array
    {
        return [
            'version' => 1,
            'exported_at' => now()->toIso8601String(),
            'type' => 'system',
            'shops' => Shop::all()->map(fn ($s) => $s->to_dict(true))->toArray(),
            'users' => User::all()->map(function ($u) {
                return [
                    'id' => $u->id,
                    'username' => $u->username,
                    'email' => $u->email,
                    'password_hash' => $u->password,
                    'role' => $u->role,
                    'shop_id' => $u->shop_id,
                    'status' => $u->status,
                ];
            })->toArray(),
            'categories' => Category::all()->map(fn ($c) => $c->to_dict())->toArray(),
            'products' => Product::all()->map(fn ($p) => $p->to_dict())->toArray(),
            'orders' => Order::with(['shop', 'items'])->get()->map(fn ($o) => $o->to_dict(true))->toArray(),
            'customers' => Customer::all()->map(fn ($c) => $c->to_dict())->toArray(),
            'settings' => Setting::all()->map(fn ($s) => $s->to_dict())->toArray(),
        ];
    }

    protected static function walkStrings(&$data, callable $callback): void
    {
        if (is_array($data)) {
            foreach ($data as &$val) {
                self::walkStrings($val, $callback);
            }
        } elseif (is_string($data)) {
            $data = $callback($data);
        }
    }

    protected static function collectRefs(array $data, string $prefix): array
    {
        $refs = [];
        self::walkStrings($data, function ($str) use (&$refs, $prefix) {
            if (str_starts_with($str, $prefix)) {
                $refs[$str] = true;
            }

            return $str;
        });

        return array_keys($refs);
    }

    protected static function rewriteRefs(array $data, array $mapping): array
    {
        self::walkStrings($data, function ($str) use ($mapping) {
            return $mapping[$str] ?? $str;
        });

        return $data;
    }

    public static function createBackup(?int $shopId = null, string $fmt = 'json'): array
    {
        $dir = public_path('backups');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $isSystem = ($shopId === null);
        $data = $isSystem ? self::collectSystemData() : self::collectShopData($shopId);

        $prefix = $isSystem ? 'system' : "shop_{$shopId}";
        $timestamp = date('Ymd_His');

        $fmt = strtolower($fmt ?: 'json');
        if ($fmt === 'zip') {
            $filename = "{$prefix}_{$timestamp}.zip";
            $filepath = "{$dir}/{$filename}";

            // Map /uploads/ to images/
            $uploadRefs = self::collectRefs($data, '/uploads/');
            $mapping = [];
            $uploadsDir = public_path('uploads');

            foreach ($uploadRefs as $ref) {
                $rel = ltrim(substr($ref, strlen('/uploads/')), '/');
                $src = "{$uploadsDir}/{$rel}";
                if (file_exists($src) && is_file($src)) {
                    $mapping[$ref] = 'images/'.$rel;
                }
            }

            if (! empty($mapping)) {
                $data = self::rewriteRefs($data, $mapping);
            }

            $zip = new ZipArchive;
            if ($zip->open($filepath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $jsonFilename = "{$prefix}_{$timestamp}.json";
                $zip->addFromString($jsonFilename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                foreach ($mapping as $origRef => $newRef) {
                    $rel = substr($newRef, strlen('images/'));
                    $src = "{$uploadsDir}/{$rel}";
                    if (file_exists($src)) {
                        $zip->addFile($src, $newRef);
                    }
                }
                $zip->close();
            }
        } else {
            $filename = "{$prefix}_{$timestamp}.json";
            $filepath = "{$dir}/{$filename}";
            File::put($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        $record = BackupHistory::create([
            'shop_id' => $shopId,
            'filename' => $filename,
            'filepath' => $filepath,
            'kind' => $isSystem ? 'system' : 'shop',
        ]);

        return [
            'id' => $record->id,
            'filename' => $filename,
            'filepath' => str_replace('\\', '/', $filepath),
            'url' => "/backups/{$filename}",
            'kind' => $record->kind,
            'created_at' => $record->created_at->toIso8601String(),
            'size' => file_exists($filepath) ? filesize($filepath) : 0,
        ];
    }

    public static function exportBackupExcel(?int $shopId = null): string
    {
        $dir = public_path('backups');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $isSystem = ($shopId === null);
        $data = $isSystem ? self::collectSystemData() : self::collectShopData($shopId);

        $prefix = $isSystem ? 'system' : "shop_{$shopId}";
        $timestamp = date('Ymd_His');
        $filename = "{$prefix}_{$timestamp}.xlsx";
        $filepath = "{$dir}/{$filename}";

        $spreadsheet = new Spreadsheet;

        // Overview Sheet
        $overviewSheet = $spreadsheet->getActiveSheet();
        $overviewSheet->setTitle('overview');
        $overviewSheet->setCellValue('A1', 'key')->setCellValue('B1', 'value');
        $overviewSheet->setCellValue('A2', 'type')->setCellValue('B2', $data['type'] ?? '');
        $overviewSheet->setCellValue('A3', 'version')->setCellValue('B3', $data['version'] ?? 1);
        $overviewSheet->setCellValue('A4', 'exported_at')->setCellValue('B4', $data['exported_at'] ?? '');
        self::styleHeader($overviewSheet);

        $sections = $isSystem
            ? ['shops', 'users', 'categories', 'products', 'orders', 'customers', 'settings']
            : ['categories', 'products', 'orders', 'customers', 'settings'];

        foreach ($sections as $section) {
            $rows = $data[$section] ?? [];
            $sheet = $spreadsheet->createSheet();
            $sheet->setTitle(ucfirst($section));

            if (empty($rows)) {
                $sheet->setCellValue('A1', 'no_data');

                continue;
            }

            $headers = array_keys($rows[0]);
            $colNum = 1;
            foreach ($headers as $h) {
                $coord = Coordinate::stringFromColumnIndex($colNum).'1';
                $sheet->setCellValue($coord, $h);
                $colNum++;
            }
            self::styleHeader($sheet);

            $rowNum = 2;
            foreach ($rows as $row) {
                $colNum = 1;
                foreach ($headers as $h) {
                    $val = $row[$h] ?? null;
                    if (is_array($val) || is_object($val)) {
                        $val = json_encode($val, JSON_UNESCAPED_UNICODE);
                    }
                    $coord = Coordinate::stringFromColumnIndex($colNum).$rowNum;
                    $sheet->setCellValue($coord, $val);
                    $colNum++;
                }
                $rowNum++;
            }

            for ($i = 1; $i <= count($headers); $i++) {
                $colLetter = Coordinate::stringFromColumnIndex($i);
                $sheet->getColumnDimension($colLetter)->setWidth(min(42, max(10, strlen($headers[$i - 1]) + 4)));
            }
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filepath);

        BackupHistory::create([
            'shop_id' => $shopId,
            'filename' => $filename,
            'filepath' => $filepath,
            'kind' => $isSystem ? 'system' : 'shop',
        ]);

        return $filepath;
    }

    protected static function styleHeader($ws): void
    {
        $highestColumn = $ws->getHighestColumn();
        $ws->getStyle("A1:{$highestColumn}1")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $ws->getStyle("A1:{$highestColumn}1")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1F4E8C');
        $ws->getStyle("A1:{$highestColumn}1")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $ws->freezePane('A2');
    }

    protected static function readBackup(string $filepath): array
    {
        $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

        if ($ext === 'xlsx') {
            return [self::xlsxToDict($filepath), null];
        }

        if ($ext === 'zip') {
            $extractDir = public_path('backups/_extract_'.time());
            if (File::exists($extractDir)) {
                File::deleteDirectory($extractDir);
            }
            File::makeDirectory($extractDir, 0755, true);

            $zip = new ZipArchive;
            $jsonContent = null;
            if ($zip->open($filepath) === true) {
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $name = $zip->getNameIndex($i);
                    if (str_ends_with(strtolower($name), '.json') && ! str_starts_with($name, 'images/')) {
                        $jsonContent = $zip->getFromIndex($i);
                        break;
                    }
                }
                $zip->extractTo($extractDir);
                $zip->close();
            }

            if (! $jsonContent) {
                throw new Exception('ZIP backup contains no JSON data file');
            }

            $data = json_decode($jsonContent, true);
            $imageRoot = is_dir("{$extractDir}/images") ? "{$extractDir}/images" : null;

            return [$data, $imageRoot];
        }

        $content = file_get_contents($filepath);
        $data = json_decode($content, true);

        return [$data, null];
    }

    protected static function xlsxToDict(string $filepath): array
    {
        $spreadsheet = IOFactory::load($filepath);
        $data = [
            'type' => 'system',
            'categories' => [],
            'products' => [],
            'orders' => [],
            'customers' => [],
            'settings' => [],
        ];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $name = strtolower($sheet->getTitle());
            $sheetRows = $sheet->toArray();
            if (count($sheetRows) <= 1) {
                continue;
            }

            $headers = $sheetRows[0];
            $rows = [];
            for ($r = 1; $r < count($sheetRows); $r++) {
                $row = [];
                $hasData = false;
                foreach ($headers as $idx => $h) {
                    if (! $h || $h === 'no_data') {
                        continue;
                    }
                    $val = $sheetRows[$r][$idx] ?? null;
                    if ($val !== null && $val !== '' && $val !== 'no_data') {
                        $hasData = true;
                    }
                    if (is_string($val)) {
                        $trimmed = trim($val);
                        if (str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{')) {
                            $decoded = json_decode($trimmed, true);
                            if ($decoded !== null) {
                                $val = $decoded;
                            }
                        }
                    }
                    $row[$h] = $val;
                }
                if ($hasData) {
                    $rows[] = $row;
                }
            }

            if ($name === 'overview') {
                foreach ($rows as $item) {
                    if (($item['key'] ?? '') === 'type') {
                        $data['type'] = $item['value'] ?? 'system';
                    }
                }
            } elseif ($name === 'shop' && ! empty($rows)) {
                $data['shop'] = $rows[0];
            } else {
                $data[$name] = $rows;
            }
        }

        return $data;
    }

    protected static function restoreImages(array $data, ?string $imageRoot): array
    {
        if (! $imageRoot || ! is_dir($imageRoot)) {
            return [$data, 0];
        }

        $uploadsDir = public_path('uploads');
        if (! File::exists($uploadsDir)) {
            File::makeDirectory($uploadsDir, 0755, true);
        }

        $imageRefs = self::collectRefs($data, 'images/');
        $mapping = [];
        $count = 0;

        foreach ($imageRefs as $ref) {
            $rel = ltrim(substr($ref, strlen('images/')), '/');
            if (! $rel) {
                continue;
            }

            $src = "{$imageRoot}/{$rel}";
            if (! file_exists($src) || ! is_file($src)) {
                continue;
            }

            $dest = "{$uploadsDir}/{$rel}";
            $destDir = dirname($dest);
            if (! File::exists($destDir)) {
                File::makeDirectory($destDir, 0755, true);
            }

            copy($src, $dest);
            $mapping[$ref] = "/uploads/{$rel}";
            $count++;
        }

        if (! empty($mapping)) {
            $data = self::rewriteRefs($data, $mapping);
        }

        return [$data, $count];
    }

    protected static function orderCore(string $number): string
    {
        $core = $number ?: '';
        while (preg_match('/-\d{6}$/', $core) && ! preg_match('/-\d{14}$/', $core)) {
            $core = preg_replace('/-\d{6}$/', '', $core);
        }

        return $core;
    }

    protected static function restoreShopContents(int $shopId, array $data): array
    {
        $added = 0;
        $skipped = 0;
        $idMap = [];
        $seenCatIds = [];
        $seenProducts = [];

        // 1. Categories
        foreach ($data['categories'] ?? [] as $c) {
            $oldId = $c['id'] ?? null;
            $name = trim($c['name'] ?? '');
            $key = strtolower($name);

            if ($key && isset($seenCatIds[$key])) {
                $idMap[$oldId] = $seenCatIds[$key];
                $skipped++;

                continue;
            }

            if ($key) {
                $existing = Category::where('shop_id', $shopId)->whereRaw('LOWER(name) = ?', [$key])->first();
                if ($existing) {
                    $idMap[$oldId] = $existing->id;
                    $seenCatIds[$key] = $existing->id;
                    $skipped++;

                    continue;
                }
            }

            $cat = Category::create([
                'shop_id' => $shopId,
                'name' => $c['name'] ?? '',
                'slug' => $c['slug'] ?? '',
                'parent_id' => $c['parent_id'] ?? null,
                'image' => $c['image'] ?? '',
                'sort_order' => $c['sort_order'] ?? 0,
            ]);

            $idMap[$oldId] = $cat->id;
            if ($key) {
                $seenCatIds[$key] = $cat->id;
            }
            $added++;
        }

        // 2. Products
        foreach ($data['products'] ?? [] as $p) {
            $name = trim($p['name'] ?? '');
            $key = strtolower($name);

            if ($key && isset($seenProducts[$key])) {
                $skipped++;

                continue;
            }

            if ($key) {
                $existing = Product::where('shop_id', $shopId)->whereRaw('LOWER(name) = ?', [$key])->first();
                if ($existing) {
                    $seenProducts[$key] = true;
                    $skipped++;

                    continue;
                }
            }

            $oldCat = $p['category_id'] ?? null;
            $newCat = $idMap[$oldCat] ?? $oldCat;

            Product::create([
                'shop_id' => $shopId,
                'category_id' => $newCat,
                'name' => $p['name'] ?? '',
                'description' => $p['description'] ?? '',
                'price' => (float) ($p['price'] ?? 0),
                'sale_price' => isset($p['sale_price']) && $p['sale_price'] !== null ? (float) $p['sale_price'] : null,
                'quantity' => (int) ($p['quantity'] ?? 0),
                'images' => is_array($p['images'] ?? null) ? json_encode($p['images'], JSON_UNESCAPED_UNICODE) : ($p['images'] ?? '[]'),
                'custom_attributes' => is_array($p['custom_attributes'] ?? null) ? json_encode($p['custom_attributes'], JSON_UNESCAPED_UNICODE) : ($p['custom_attributes'] ?? '[]'),
                'variations' => is_array($p['variations'] ?? null) ? json_encode($p['variations'], JSON_UNESCAPED_UNICODE) : ($p['variations'] ?? '[]'),
                'metadata_json' => is_array($p['metadata'] ?? null) ? json_encode($p['metadata'], JSON_UNESCAPED_UNICODE) : ($p['metadata_json'] ?? '{}'),
                'featured' => (bool) ($p['featured'] ?? false),
                'status' => $p['status'] ?? 'active',
            ]);

            if ($key) {
                $seenProducts[$key] = true;
            }
            $added++;
        }

        // 3. Customers
        $seenCust = [];
        foreach ($data['customers'] ?? [] as $c) {
            $phone = trim($c['phone'] ?? '');
            $telegram = trim($c['telegram'] ?? '');
            $key = $phone ?: $telegram;

            if ($key && isset($seenCust[$key])) {
                $skipped++;

                continue;
            }

            if ($key) {
                $existing = Customer::where('shop_id', $shopId)
                    ->where(function ($q) use ($phone, $telegram) {
                        if ($phone && $telegram) {
                            $q->where('phone', $phone)->orWhere('telegram', $telegram);
                        } elseif ($phone) {
                            $q->where('phone', $phone);
                        } else {
                            $q->where('telegram', $telegram);
                        }
                    })->first();

                if ($existing) {
                    $seenCust[$key] = true;
                    $skipped++;

                    continue;
                }
            }

            Customer::create([
                'shop_id' => $shopId,
                'name' => $c['name'] ?? '',
                'phone' => $c['phone'] ?? '',
                'telegram' => $c['telegram'] ?? '',
                'email' => $c['email'] ?? '',
                'address' => $c['address'] ?? '',
                'city' => $c['city'] ?? '',
                'country' => $c['country'] ?? '',
                'notes' => $c['notes'] ?? '',
            ]);

            if ($key) {
                $seenCust[$key] = true;
            }
            $added++;
        }

        // 4. Orders
        $suffix = date('His');
        $existingCores = Order::where('shop_id', $shopId)->get()->map(fn ($o) => self::orderCore($o->order_number))->flip()->toArray();
        $seenOrders = [];

        foreach ($data['orders'] ?? [] as $o) {
            $number = trim($o['order_number'] ?? '');
            $core = self::orderCore($number);

            if ($core && (isset($seenOrders[$core]) || isset($existingCores[$core]))) {
                $skipped++;

                continue;
            }

            $orderNumber = $core ? "{$core}-{$suffix}" : "IMP-{$suffix}";

            $order = Order::create([
                'shop_id' => $shopId,
                'order_number' => $orderNumber,
                'customer_name' => $o['customer_name'] ?? '',
                'customer_email' => $o['customer_email'] ?? '',
                'customer_phone' => $o['customer_phone'] ?? '',
                'customer_telegram' => $o['customer_telegram'] ?? '',
                'customer_address' => $o['customer_address'] ?? '',
                'customer_city' => $o['customer_city'] ?? '',
                'customer_country' => $o['customer_country'] ?? '',
                'customer_note' => $o['customer_note'] ?? '',
                'items_total' => (float) ($o['items_total'] ?? 0),
                'shipping_fee' => (float) ($o['shipping_fee'] ?? 0),
                'discount' => (float) ($o['discount'] ?? 0),
                'total' => (float) ($o['total'] ?? 0),
                'currency' => $o['currency'] ?? 'USD',
                'payment_status' => $o['payment_status'] ?? 'pending',
                'order_status' => $o['order_status'] ?? 'pending',
            ]);

            foreach ($o['items'] ?? [] as $it) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $it['product_id'] ?? null,
                    'product_name' => $it['product_name'] ?? '',
                    'price' => (float) ($it['price'] ?? 0),
                    'quantity' => (int) ($it['quantity'] ?? 1),
                    'variations' => is_array($it['variations'] ?? null) ? json_encode($it['variations'], JSON_UNESCAPED_UNICODE) : ($it['variations'] ?? '{}'),
                ]);
            }

            if ($core) {
                $seenOrders[$core] = true;
                $existingCores[$core] = true;
            }

            $added += 1 + count($o['items'] ?? []);
        }

        // 5. Settings
        $seenSettings = [];
        foreach ($data['settings'] ?? [] as $s) {
            $k = trim($s['key'] ?? '');
            if (! $k) {
                continue;
            }

            if (isset($seenSettings[$k])) {
                $skipped++;

                continue;
            }

            $existing = Setting::where('shop_id', $shopId)->where('key', $k)->first();
            if ($existing) {
                $seenSettings[$k] = true;
                $skipped++;

                continue;
            }

            Setting::create([
                'shop_id' => $shopId,
                'key' => $k,
                'value' => is_array($s['value'] ?? null) ? json_encode($s['value'], JSON_UNESCAPED_UNICODE) : (string) ($s['value'] ?? ''),
            ]);

            $seenSettings[$k] = true;
            $added++;
        }

        return [$added, $skipped];
    }

    public static function importShopBackup(int $shopId, string $filepath): array
    {
        [$data, $imageRoot] = self::readBackup($filepath);
        [$data, $imagesRestored] = self::restoreImages($data, $imageRoot);

        if (($data['type'] ?? '') === 'system') {
            throw new Exception('This is a system backup, not a shop backup');
        }

        $count = 0;
        $skipped = 0;

        DB::transaction(function () use ($shopId, $data, &$count, &$skipped) {
            $shopData = $data['shop'] ?? [];

            $shop = Shop::find($shopId);
            if ($shop && ! empty($shopData)) {
                $shop->shop_name = $shopData['shop_name'] ?? $shop->shop_name;
                $shop->logo = $shopData['logo'] ?? $shop->logo;
                $shop->banner = $shopData['banner'] ?? $shop->banner;
                $shop->bio = $shopData['bio'] ?? $shop->bio;
                $shop->description = $shopData['description'] ?? $shop->description;
                if (isset($shopData['slideshow'])) {
                    $shop->slideshow = is_array($shopData['slideshow']) ? json_encode($shopData['slideshow'], JSON_UNESCAPED_UNICODE) : $shopData['slideshow'];
                }
                if (isset($shopData['social_media'])) {
                    $shop->social_media = is_array($shopData['social_media']) ? json_encode($shopData['social_media'], JSON_UNESCAPED_UNICODE) : $shopData['social_media'];
                }
                if (isset($shopData['theme'])) {
                    $shop->theme = is_array($shopData['theme']) ? json_encode($shopData['theme'], JSON_UNESCAPED_UNICODE) : $shopData['theme'];
                }
                if (isset($shopData['aba_settings'])) {
                    $shop->aba_settings = is_array($shopData['aba_settings']) ? json_encode($shopData['aba_settings'], JSON_UNESCAPED_UNICODE) : $shopData['aba_settings'];
                }
                if (isset($shopData['telegram_settings'])) {
                    $shop->telegram_settings = is_array($shopData['telegram_settings']) ? json_encode($shopData['telegram_settings'], JSON_UNESCAPED_UNICODE) : $shopData['telegram_settings'];
                }
                $shop->contact = $shopData['contact'] ?? $shop->contact;
                $shop->save();
                $count++;
            }

            [$added, $skipped] = self::restoreShopContents($shopId, $data);
            $count += $added;
        });

        return [$count, $skipped, $imagesRestored];
    }

    public static function importSystemBackup(string $filepath): array
    {
        [$data, $imageRoot] = self::readBackup($filepath);
        [$data, $imagesRestored] = self::restoreImages($data, $imageRoot);

        $count = 0;
        $skipped = 0;

        DB::transaction(function () use ($data, &$count, &$skipped) {
            $shopIdMap = [];

            // 1. Restore shops
            foreach ($data['shops'] ?? [] as $s) {
                $existing = Shop::where('username', $s['username'])->first();
                if ($existing) {
                    $shopIdMap[$s['id'] ?? null] = $existing->id;
                } else {
                    $newShop = Shop::create([
                        'username' => $s['username'],
                        'shop_name' => $s['shop_name'] ?? $s['username'],
                        'logo' => $s['logo'] ?? '',
                        'banner' => $s['banner'] ?? '',
                        'bio' => $s['bio'] ?? '',
                        'description' => $s['description'] ?? '',
                        'slideshow' => is_array($s['slideshow'] ?? null) ? json_encode($s['slideshow'], JSON_UNESCAPED_UNICODE) : ($s['slideshow'] ?? '[]'),
                        'social_media' => is_array($s['social_media'] ?? null) ? json_encode($s['social_media'], JSON_UNESCAPED_UNICODE) : ($s['social_media'] ?? '{}'),
                        'theme' => is_array($s['theme'] ?? null) ? json_encode($s['theme'], JSON_UNESCAPED_UNICODE) : ($s['theme'] ?? '{}'),
                        'aba_settings' => is_array($s['aba_settings'] ?? null) ? json_encode($s['aba_settings'], JSON_UNESCAPED_UNICODE) : ($s['aba_settings'] ?? '{}'),
                        'telegram_settings' => is_array($s['telegram_settings'] ?? null) ? json_encode($s['telegram_settings'], JSON_UNESCAPED_UNICODE) : ($s['telegram_settings'] ?? '{}'),
                        'currency' => $s['currency'] ?? 'USD',
                        'status' => $s['status'] ?? 'active',
                        'contact' => $s['contact'] ?? '',
                        'expires_at' => ! empty($s['expires_at']) ? date('Y-m-d H:i:s', strtotime($s['expires_at'])) : null,
                    ]);
                    $shopIdMap[$s['id'] ?? null] = $newShop->id;
                }
                $count++;
            }

            // 2. Restore users
            foreach ($data['users'] ?? [] as $u) {
                $oldShopId = $u['shop_id'] ?? null;
                $newShopId = $shopIdMap[$oldShopId] ?? $oldShopId;

                $existing = User::where('username', $u['username'])->first();
                if ($existing) {
                    $existing->email = $u['email'] ?? $existing->email;
                    $existing->role = $u['role'] ?? $existing->role;
                    $existing->status = $u['status'] ?? $existing->status;
                    if ($newShopId !== null) {
                        $existing->shop_id = $newShopId;
                    }
                    $existing->save();
                } else {
                    User::create([
                        'username' => $u['username'],
                        'email' => $u['email'] ?? '',
                        'password' => $u['password_hash'] ?? '',
                        'role' => $u['role'] ?? 'shop_owner',
                        'shop_id' => $newShopId,
                        'status' => $u['status'] ?? 'active',
                    ]);
                }
                $count++;
            }

            // 3. Group and restore contents per shop
            $byShop = [];
            foreach ($data['categories'] ?? [] as $c) {
                $sId = $c['shop_id'] ?? 0;
                $byShop[$sId]['categories'][] = $c;
            }
            foreach ($data['products'] ?? [] as $p) {
                $sId = $p['shop_id'] ?? 0;
                $byShop[$sId]['products'][] = $p;
            }
            foreach ($data['customers'] ?? [] as $c) {
                $sId = $c['shop_id'] ?? 0;
                $byShop[$sId]['customers'][] = $c;
            }
            foreach ($data['orders'] ?? [] as $o) {
                $sId = $o['shop_id'] ?? 0;
                $byShop[$sId]['orders'][] = $o;
            }
            foreach ($data['settings'] ?? [] as $s) {
                $sId = $s['shop_id'] ?? 0;
                $byShop[$sId]['settings'][] = $s;
            }

            foreach ($byShop as $oldShopId => $contents) {
                $newShopId = $shopIdMap[$oldShopId] ?? $oldShopId;
                if (! $newShopId) {
                    continue;
                }

                [$addedContents, $skippedContents] = self::restoreShopContents($newShopId, $contents);
                $count += $addedContents;
                $skipped += $skippedContents;
            }
        });

        return [$count, $skipped, $imagesRestored];
    }
}
