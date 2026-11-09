<?php

namespace App\Actions\Shops;

use App\Models\Shop;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UpdateShopAction
{
    public function execute(Shop $shop, array $data): Shop
    {
        $fields = [
            'shop_name', 'username', 'logo', 'banner', 'bio', 'description',
            'currency', 'contact', 'status',
        ];

        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $shop->{$f} = $data[$f];
            }
        }

        if (array_key_exists('slideshow', $data)) {
            $shop->slideshow = is_string($data['slideshow']) ? $data['slideshow'] : json_encode($data['slideshow'], JSON_UNESCAPED_UNICODE);
        }

        if (array_key_exists('social_media', $data)) {
            $shop->social_media = is_string($data['social_media']) ? $data['social_media'] : json_encode($data['social_media'], JSON_UNESCAPED_UNICODE);
        }

        $shop->save();

        return $shop;
    }
}
