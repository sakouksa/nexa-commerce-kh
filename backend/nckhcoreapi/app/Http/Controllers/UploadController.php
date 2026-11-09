<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UploadController extends Controller
{
    const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB

    protected function validateAndSaveFile($file): string
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if (! in_array($ext, self::ALLOWED_EXT)) {
            throw new HttpException(400, "Image extension .{$ext} not allowed");
        }
        if ($file->getSize() > self::MAX_SIZE) {
            throw new HttpException(400, 'File too large (max 8MB)');
        }

        $dir = public_path('uploads');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $filename = Str::uuid()->getHex()->toString().".{$ext}";
        $file->move($dir, $filename);

        return $filename;
    }

    public function upload(Request $request)
    {
        $file = $request->file('file');
        if (! $file) {
            throw new HttpException(400, 'No file uploaded');
        }

        $filename = $this->validateAndSaveFile($file);

        return response()->json([
            'url' => "/uploads/{$filename}",
            'filename' => $filename,
        ]);
    }

    public function uploadProduct(Request $request)
    {
        $files = $request->file('files', []);
        if (empty($files) && $request->hasFile('file')) {
            $files = [$request->file('file')];
        }

        $urls = [];
        foreach ($files as $file) {
            $filename = $this->validateAndSaveFile($file);
            $urls[] = "/uploads/{$filename}";
        }

        return response()->json([
            'urls' => $urls,
        ]);
    }
}
