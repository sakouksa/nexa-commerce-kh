<?php
/**
 * Generate simple placeholder demo images for the demo shop.
 */
$dir = __DIR__ . '/public/uploads/demo';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

function hex2rgb($hex) {
    $hex = ltrim($hex, '#');
    return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
}

function make_gradient($w, $h, $c1, $c2, $text, $filename, $sub = '') {
    global $dir;
    $im = imagecreatetruecolor($w, $h);
    [$r1, $g1, $b1] = hex2rgb($c1);
    [$r2, $g2, $b2] = hex2rgb($c2);
    for ($y = 0; $y < $h; $y++) {
        $t = $y / $h;
        $r = (int)($r1 * (1 - $t) + $r2 * $t);
        $g = (int)($g1 * (1 - $t) + $g2 * $t);
        $b = (int)($b1 * (1 - $t) + $b2 * $t);
        $col = imagecolorallocate($im, $r, $g, $b);
        imageline($im, 0, $y, $w, $y, $col);
    }
    $white = imagecolorallocate($im, 255, 255, 255);
    $font = 5;
    $tw = imagefontwidth($font) * strlen($text);
    $th = imagefontheight($font);
    imagestring($im, $font, (int)(($w - $tw)/2), (int)(($h - $th)/2 - 15), $text, $white);
    if ($sub) {
        $sw = imagefontwidth(3) * strlen($sub);
        imagestring($im, 3, (int)(($w - $sw)/2), (int)(($h - $th)/2 + 20), $sub, $white);
    }
    imagejpeg($im, "$dir/$filename", 90);
    imagedestroy($im);
}

function make_product_image($w, $h, $bg, $text, $filename) {
    global $dir;
    $im = imagecreatetruecolor($w, $h);
    [$r, $g, $b] = hex2rgb($bg);
    $bgCol = imagecolorallocate($im, $r, $g, $b);
    imagefill($im, 0, 0, $bgCol);
    $white = imagecolorallocate($im, 255, 255, 255);
    $font = 5;
    $tw = imagefontwidth($font) * strlen($text);
    $th = imagefontheight($font);
    imagestring($im, $font, (int)(($w - $tw)/2), (int)(($h - $th)/2), $text, $white);
    imagejpeg($im, "$dir/$filename", 90);
    imagedestroy($im);
}

make_gradient(1200, 400, "#6366f1", "#8b5cf6", "Demo Fashion Store", "banner1.jpg", "Summer Sale - Up to 50% Off");
make_gradient(1200, 400, "#ec4899", "#f97316", "New Arrivals", "banner2.jpg", "Shop the latest collection");
make_product_image(600, 600, "#93c5fd", "T-Shirt", "tshirt.jpg");
make_product_image(600, 600, "#a7f3d0", "T-Shirt 2", "tshirt2.jpg");
make_product_image(600, 600, "#fbcfe8", "Dress", "dress.jpg");
make_product_image(600, 600, "#d6d3d1", "Bag", "bag.jpg");
make_product_image(600, 600, "#bfdbfe", "Jacket", "jacket.jpg");

echo "Demo images generated in " . $dir . "\n";
