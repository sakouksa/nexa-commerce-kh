<?php

namespace App\Http\Controllers;

use App\Helpers\ShopHelper;
use App\Models\BackupHistory;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpKernel\Exception\HttpException;

class BackupController extends Controller
{
    protected function serveExport(string $fmt, ?int $shopId = null)
    {
        $fmt = strtolower($fmt ?: 'xlsx');
        if ($fmt === 'xlsx') {
            $filepath = BackupService::exportBackupExcel($shopId);
        } else {
            $res = BackupService::createBackup($shopId, $fmt);
            $filepath = $res['filepath'];
        }

        $filename = basename($filepath);
        $contentType = match (true) {
            str_ends_with($filepath, '.xlsx') => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            str_ends_with($filepath, '.zip') => 'application/zip',
            default => 'application/json',
        };

        return response()->download($filepath, $filename, [
            'Content-Type' => $contentType,
        ]);
    }

    public function adminExport(Request $request)
    {
        $fmt = $request->input('export_format', 'xlsx');
        return $this->serveExport($fmt, null);
    }

    public function shopExport(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);
        $fmt = $request->input('export_format', 'xlsx');
        return $this->serveExport($fmt, $shopId);
    }

    public function createShopBackup(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);
        $fmt = $request->input('format', 'json');
        $res = BackupService::createBackup($shopId, $fmt);

        ShopHelper::logActivity('create_backup', "{$user->username} created shop backup {$res['filename']}", $shopId, $user);
        return response()->json($res);
    }

    public function importShopBackup(Request $request, int $shopId)
    {
        $user = $request->user();
        ShopHelper::requireShopAccess($shopId, $user);

        $file = $request->file('file');
        if (!$file) {
            throw new HttpException(400, 'No backup file uploaded');
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['json', 'zip', 'xlsx'])) {
            throw new HttpException(400, 'Only .json, .zip or .xlsx files are allowed');
        }

        $dir = public_path('backups');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $savedFilename = 'import_' . time() . "_{$file->getClientOriginalName()}";
        $savedPath = "{$dir}/{$savedFilename}";
        $file->move($dir, $savedFilename);

        try {
            [$restored, $skipped, $imagesRestored] = BackupService::importShopBackup($shopId, $savedPath);
        } catch (\Exception $e) {
            throw new HttpException(400, "Import failed: " . $e->getMessage());
        }

        ShopHelper::logActivity('import_backup', "{$user->username} imported shop backup ({$restored} records, {$skipped} duplicates skipped, {$imagesRestored} images)", $shopId, $user);

        return response()->json([
            'ok' => true,
            'records_restored' => $restored,
            'duplicates_skipped' => $skipped,
            'images_restored' => $imagesRestored,
        ]);
    }

    public function createSystemBackup(Request $request)
    {
        $fmt = $request->input('format', 'json');
        $res = BackupService::createBackup(null, $fmt);
        return response()->json($res);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $shopId = $request->input('shop_id', $user->shop_id);

        if ($shopId) {
            ShopHelper::requireShopAccess((int) $shopId, $user);
            $backups = BackupHistory::where('shop_id', (int) $shopId)->orderBy('id', 'desc')->get();
        } else {
            if ($user->role !== 'admin') {
                throw new HttpException(403, 'Admin privileges required');
            }
            $backups = BackupHistory::orderBy('id', 'desc')->get();
        }

        return response()->json($backups->map(fn($b) => $b->to_dict())->toArray());
    }

    public function deleteHistory(Request $request, int $backupId)
    {
        $user = $request->user();
        $backup = BackupHistory::find($backupId);
        if (!$backup) {
            throw new HttpException(404, 'Backup not found');
        }

        if ($backup->shop_id) {
            ShopHelper::requireShopAccess($backup->shop_id, $user);
        } elseif ($user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        if ($backup->filepath && file_exists($backup->filepath)) {
            @unlink($backup->filepath);
        }
        $backup->delete();

        return response()->json(['ok' => true]);
    }

    public function downloadHistory(Request $request, int $backupId)
    {
        $user = $request->user();
        $backup = BackupHistory::find($backupId);
        if (!$backup) {
            throw new HttpException(404, 'Backup not found');
        }

        if ($backup->shop_id) {
            ShopHelper::requireShopAccess($backup->shop_id, $user);
        } elseif ($user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        if (!file_exists($backup->filepath)) {
            throw new HttpException(404, 'Backup file not found on disk');
        }

        return response()->download($backup->filepath, $backup->filename);
    }

    public function adminImport(Request $request)
    {
        $admin = $request->user();
        if ($admin->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        $file = $request->file('file');
        if (!$file) {
            throw new HttpException(400, 'No backup file uploaded');
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['json', 'zip', 'xlsx'])) {
            throw new HttpException(400, 'Only .json, .zip or .xlsx files are allowed');
        }

        $dir = public_path('backups');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $savedFilename = 'import_' . time() . "_{$file->getClientOriginalName()}";
        $savedPath = "{$dir}/{$savedFilename}";
        $file->move($dir, $savedFilename);

        try {
            [$restored, $skipped, $imagesRestored] = BackupService::importSystemBackup($savedPath);
        } catch (\Exception $e) {
            throw new HttpException(500, "Import failed: " . $e->getMessage());
        }

        ShopHelper::logActivity('system_import', "Admin imported system backup ({$restored} records, {$skipped} duplicates skipped, {$imagesRestored} images)", null, $admin);

        return response()->json([
            'ok' => true,
            'records_restored' => $restored,
            'duplicates_skipped' => $skipped,
            'images_restored' => $imagesRestored,
        ]);
    }

    public function downloadBackup(Request $request)
    {
        $filename = $request->input('filename', '');
        $safe = basename($filename);
        if (!$safe) {
            throw new HttpException(400, 'filename is required');
        }

        $path = public_path("backups/{$safe}");
        if (!file_exists($path)) {
            throw new HttpException(404, 'Backup file not found');
        }

        $user = $request->user();
        $record = BackupHistory::where('filename', $safe)->first();
        if ($record && $record->shop_id !== null) {
            ShopHelper::requireShopAccess($record->shop_id, $user);
        } elseif ($record && $record->shop_id === null && $user->role !== 'admin') {
            throw new HttpException(403, 'Admin privileges required');
        }

        return response()->json([
            'url' => "/backups/{$safe}",
            'filename' => $safe,
        ]);
    }
}

