<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1) Default admin account
        $adminUsername = env('DEFAULT_ADMIN_USERNAME', 'admin');
        $adminEmail = env('DEFAULT_ADMIN_EMAIL', 'admin@ministorekh.com');
        $adminPassword = env('DEFAULT_ADMIN_PASSWORD', 'admin123');

        $admin = User::where('username', $adminUsername)->first();
        if (!$admin) {
            User::create([
                'username' => $adminUsername,
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'status' => 'active',
            ]);
        }

        // 2) Demo shop
        $demoShop = Shop::where('username', 'demo')->first();
        if (!$demoShop) {
            $demoShop = Shop::create([
                'username' => 'demo',
                'shop_name' => 'Demo Fashion Store',
                'bio' => 'Your friendly neighbourhood demo shop for trying the Mini Shop platform.',
                'description' => 'Welcome to our demo store! Browse our products, pick your favourites, and experience the full checkout flow with ABA Pay (sandbox mode).',
                'slideshow' => json_encode([
                    '/uploads/demo/banner1.jpg',
                    '/uploads/demo/banner2.jpg',
                ]),
                'social_media' => json_encode([
                    'facebook' => 'https://facebook.com/demostore',
                    'instagram' => 'https://instagram.com/demostore',
                    'telegram' => 'https://t.me/your_telegram',
                    'tiktok' => 'https://tiktok.com/@demostore',
                    'youtube' => '',
                    'whatsapp' => '',
                    'twitter' => '',
                ]),
                'theme' => json_encode([
                    'primary' => '#6366f1',
                    'secondary' => '#ec4899',
                    'font_family' => 'Inter',
                ]),
                'aba_settings' => json_encode([
                    'profile_id' => '',
                    'secret_key' => '',
                    'test_mode' => true,
                ]),
                'telegram_settings' => json_encode([
                    'bot_token' => '',
                    'chat_id' => '',
                    'enabled' => false,
                ]),
                'currency' => 'USD',
                'contact' => 'Phnom Penh, Cambodia | Telegram: @your_telegram',
                'status' => 'active',
                'plan' => 'starter',
                'plan_price' => 0.0,
                'plan_started_at' => now(),
                'expires_at' => now()->addDays(365),
                'max_products' => 20,
                'max_categories' => 10,
            ]);

            // Demo owner account
            User::create([
                'username' => 'demo',
                'email' => 'demo@ministorekh.com',
                'password' => Hash::make('demo123'),
                'role' => 'shop_owner',
                'shop_id' => $demoShop->id,
                'status' => 'active',
            ]);

            // Categories
            $catMen = Category::create([
                'shop_id' => $demoShop->id,
                'name' => 'Men',
                'slug' => 'men',
                'sort_order' => 1,
            ]);

            $catWomen = Category::create([
                'shop_id' => $demoShop->id,
                'name' => 'Women',
                'slug' => 'women',
                'sort_order' => 2,
            ]);

            $catAcc = Category::create([
                'shop_id' => $demoShop->id,
                'name' => 'Accessories',
                'slug' => 'accessories',
                'sort_order' => 3,
            ]);

            // Products
            Product::create([
                'shop_id' => $demoShop->id,
                'category_id' => $catMen->id,
                'name' => 'Classic White T-Shirt',
                'description' => 'Soft cotton t-shirt, perfect for everyday wear. Available in multiple sizes.',
                'price' => 12.00,
                'sale_price' => 9.99,
                'quantity' => 100,
                'featured' => true,
                'images' => json_encode(['/uploads/demo/tshirt.jpg', '/uploads/demo/tshirt2.jpg']),
                'custom_attributes' => json_encode([
                    ['name' => 'material', 'label' => 'Material', 'type' => 'text', 'value' => '100% Cotton', 'options' => '', 'required' => false],
                    ['name' => 'color', 'label' => 'Color', 'type' => 'color', 'value' => '#ffffff', 'options' => 'White,Black,Blue', 'required' => true],
                    ['name' => 'size', 'label' => 'Size', 'type' => 'select', 'value' => '', 'options' => 'S,M,L,XL', 'required' => true],
                ]),
                'variations' => json_encode([
                    ['attrs' => ['size' => 'S'], 'price' => 9.99, 'quantity' => 30, 'sku' => 'TS-W-S'],
                    ['attrs' => ['size' => 'M'], 'price' => 9.99, 'quantity' => 40, 'sku' => 'TS-W-M'],
                    ['attrs' => ['size' => 'L'], 'price' => 9.99, 'quantity' => 30, 'sku' => 'TS-W-L'],
                ]),
                'status' => 'active',
            ]);

            Product::create([
                'shop_id' => $demoShop->id,
                'category_id' => $catMen->id,
                'name' => 'Slim Fit Denim Jeans',
                'description' => 'Premium denim with a modern slim fit. Comfortable stretch fabric.',
                'price' => 35.00,
                'sale_price' => 29.99,
                'quantity' => 50,
                'featured' => true,
                'images' => json_encode(['/uploads/demo/jacket.jpg']),
                'custom_attributes' => json_encode([]),
                'variations' => json_encode([]),
                'status' => 'active',
            ]);

            Product::create([
                'shop_id' => $demoShop->id,
                'category_id' => $catWomen->id,
                'name' => 'Floral Summer Dress',
                'description' => 'Light and breezy floral dress, ideal for warm sunny days.',
                'price' => 28.00,
                'sale_price' => 22.50,
                'quantity' => 40,
                'featured' => true,
                'images' => json_encode(['/uploads/demo/dress.jpg']),
                'custom_attributes' => json_encode([]),
                'variations' => json_encode([]),
                'status' => 'active',
            ]);

            Product::create([
                'shop_id' => $demoShop->id,
                'category_id' => $catAcc->id,
                'name' => 'Minimalist Leather Wallet',
                'description' => 'Slim genuine leather wallet with RFID blocking protection.',
                'price' => 18.00,
                'sale_price' => null,
                'quantity' => 75,
                'featured' => false,
                'images' => json_encode(['/uploads/demo/bag.jpg']),
                'custom_attributes' => json_encode([]),
                'variations' => json_encode([]),
                'status' => 'active',
            ]);
        }
    }
}
