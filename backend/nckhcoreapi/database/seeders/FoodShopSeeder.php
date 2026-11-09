<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FoodShopSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or Update the Real F&B Shop with 1-Month Subscription
        $shop = Shop::updateOrCreate(
            ['username' => 'restrofood'],
            [
                'shop_name' => 'Restro Food & Coffee KH',
                'bio' => 'ហាងអាហារ និងភេសជ្ជៈ រសជាតិឈ្ងុយឆ្ងាញ់ ប្រចាំក្រុងភ្នំពេញ',
                'description' => 'បម្រើជូននូវអាហារ ភីហ្សា ប៊ឺហ្គឺ សាឡាត់ និងភេសជ្ជៈកាហ្វេស្រស់ៗ គុណភាពខ្ពស់។',
                'plan' => 'pro',
                'plan_price' => 15.00,
                'plan_discount' => 0.00,
                'plan_started_at' => now(),
                'expires_at' => now()->addMonth(), // Exactly 1 Month Subscription
                'status' => 'active',
                'currency' => 'USD',
                'max_products' => 100,
                'max_categories' => 30,
                'contact' => '+855 12 345 678 | Phnom Penh, Cambodia',
                'theme' => json_encode([
                    'primary' => '#ea580c',
                    'secondary' => '#c2410c',
                    'font_family' => 'Outfit',
                ]),
            ]
        );

        // 2. Create Owner Account for this F&B Shop
        User::updateOrCreate(
            ['email' => 'food@ministorekh.com'],
            [
                'username' => 'restrofood',
                'password' => Hash::make('password123'),
                'role' => 'shop_owner',
                'shop_id' => $shop->id,
                'status' => 'active',
            ]
        );

        // 3. Define F&B Categories & Products
        $categoriesData = [
            'Pizza & Burgers' => [
                'slug' => 'pizza-burgers',
                'sort_order' => 1,
                'products' => [
                    [
                        'name' => 'Margherita Pizza',
                        'price' => 2.96,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-1.webp',
                        'desc' => 'Classic pizza with fresh mozzarella, sweet tomato sauce and aromatic basil.',
                    ],
                    [
                        'name' => 'Pepperoni Pizza',
                        'price' => 3.56,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-2.webp',
                        'desc' => 'Loaded with spicy beef pepperoni slices and melting cheese crust.',
                    ],
                    [
                        'name' => 'BBQ Chicken Pizza',
                        'price' => 3.92,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-3.webp',
                        'desc' => 'Smoky barbecue sauce, tender grilled chicken chunks and red onions.',
                    ],
                    [
                        'name' => 'Classic Beef Burger',
                        'price' => 2.96,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-5.webp',
                        'desc' => 'Juicy grilled beef patty, crisp lettuce, cheddar cheese and signature house sauce.',
                    ],
                    [
                        'name' => 'Crispy Chicken Burger',
                        'price' => 2.61,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-6.webp',
                        'desc' => 'Crispy golden fried chicken breast with creamy mayo and pickles.',
                    ],
                    [
                        'name' => 'Garden Veggie Burger',
                        'price' => 2.25,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-7.webp',
                        'desc' => 'Plant-based vegetable patty with fresh tomatoes, lettuce, and vegan garlic sauce.',
                    ],
                    [
                        'name' => 'Double Smash Burger',
                        'price' => 3.92,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-8.webp',
                        'desc' => 'Two smashed beef patties, double melted American cheese on toasted brioche buns.',
                    ],
                ],
            ],
            'Soups & Salads' => [
                'slug' => 'soups-salads',
                'sort_order' => 2,
                'products' => [
                    [
                        'name' => 'Garden Fresh Salad',
                        'price' => 2.01,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-10.webp',
                        'desc' => 'Crisp mixed salad greens, cherry tomatoes, cucumbers and light balsamic vinaigrette.',
                    ],
                    [
                        'name' => 'Caesar Salad',
                        'price' => 2.25,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-9.webp',
                        'desc' => 'Romaine lettuce tossed in Caesar dressing, crunchy croutons and parmesan.',
                    ],
                    [
                        'name' => 'Greek Salad',
                        'price' => 2.49,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-11.webp',
                        'desc' => 'Kalamata olives, feta cheese cubes, cucumbers, oregano and virgin olive oil.',
                    ],
                    [
                        'name' => 'Tomato Basil Soup',
                        'price' => 1.95,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-12.webp',
                        'desc' => 'Warm roasted tomato soup with fresh basil and herb garlic croutons.',
                    ],
                    [
                        'name' => 'Cream of Mushroom',
                        'price' => 2.25,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-13.webp',
                        'desc' => 'Rich creamy soup made from sauteed wild mushrooms and fresh thyme.',
                    ],
                    [
                        'name' => 'Chicken Clear Soup',
                        'price' => 2.50,
                        'dietary' => 'Non-Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-14.webp',
                        'desc' => 'Light, comforting chicken broth with tender shredded chicken and vegetables.',
                    ],
                ],
            ],
            'Drinks & Coffee' => [
                'slug' => 'drinks-coffee',
                'sort_order' => 3,
                'products' => [
                    [
                        'name' => 'Iced Coffee Latte',
                        'price' => 2.60,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-31.webp',
                        'desc' => 'Freshly brewed espresso over chilled milk and ice (sugar and ice level customizable).',
                    ],
                    [
                        'name' => 'Mango Lassi',
                        'price' => 2.40,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-21.webp',
                        'desc' => 'Traditional yogurt drink blended with ripe sweet mango pulp and cardamom.',
                    ],
                    [
                        'name' => 'Fresh Lime Soda',
                        'price' => 1.75,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-19.webp',
                        'desc' => 'Zesty squeezed fresh lime juice mixed with sparkling soda water.',
                    ],
                    [
                        'name' => 'Strawberry Shake',
                        'price' => 2.80,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-32.webp',
                        'desc' => 'Creamy strawberry milkshake topped with whipped cream.',
                    ],
                    [
                        'name' => 'Iced Peach Tea',
                        'price' => 1.85,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-20.webp',
                        'desc' => 'Refreshing black tea infused with sweet peach essence and lemon slices.',
                    ],
                    [
                        'name' => 'Coca-Cola Zero',
                        'price' => 1.50,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-18.webp',
                        'desc' => 'Chilled 330ml can of Coca-Cola with zero sugar.',
                    ],
                ],
            ],
            'Desserts' => [
                'slug' => 'desserts',
                'sort_order' => 4,
                'products' => [
                    [
                        'name' => 'Chocolate Brownie',
                        'price' => 2.75,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-15.webp',
                        'desc' => 'Fudgy chocolate brownie served warm with a drizzle of dark chocolate fudge.',
                    ],
                    [
                        'name' => 'New York Cheesecake',
                        'price' => 3.50,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-17.webp',
                        'desc' => 'Classic dense baked cheesecake with graham cracker crust and berry compote.',
                    ],
                    [
                        'name' => 'Italian Tiramisu',
                        'price' => 3.20,
                        'dietary' => 'Veg',
                        'image' => 'https://shadcn-nextjs-restropos-admin-template.vercel.app/images/items/item-29.webp',
                        'desc' => 'Layers of coffee-soaked ladyfingers and whipped mascarpone cream.',
                    ],
                ],
            ],
        ];

        // Seed to both the new F&B shop ($shop->id) and Shop 1 (demo shop)
        $targetShopIds = array_unique([$shop->id, 1]);

        foreach ($targetShopIds as $sId) {
            foreach ($categoriesData as $catName => $catDetails) {
                $category = Category::firstOrCreate(
                    [
                        'shop_id' => $sId,
                        'name' => $catName,
                    ],
                    [
                        'slug' => $catDetails['slug'],
                        'sort_order' => $catDetails['sort_order'],
                    ]
                );

                foreach ($catDetails['products'] as $prod) {
                    Product::updateOrCreate(
                        [
                            'shop_id' => $sId,
                            'name' => $prod['name'],
                        ],
                        [
                            'category_id' => $category->id,
                            'price' => $prod['price'],
                            'sale_price' => null,
                            'quantity' => 100,
                            'description' => $prod['desc'],
                            'images' => json_encode([$prod['image']]),
                            'featured' => true,
                            'status' => 'active',
                            'custom_attributes' => json_encode([
                                [
                                    'name' => 'dietary',
                                    'label' => 'Dietary',
                                    'type' => 'badge',
                                    'value' => $prod['dietary'],
                                ],
                            ]),
                            'metadata_json' => json_encode([
                                'dietary' => $prod['dietary'],
                            ]),
                        ]
                    );
                }
            }
        }
    }
}
