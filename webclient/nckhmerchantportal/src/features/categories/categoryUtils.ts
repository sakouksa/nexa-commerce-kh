import { translateString } from '../../i18n/i18n';

// Static Category Names mapping between English and Khmer
export const CATEGORY_MAP_EN_TO_KH: Record<string, string> = {
  pizza: 'ភីហ្សា',
  burgers: 'ប៊ឺហ្គឺ',
  burger: 'ប៊ឺហ្គឺ',
  salads: 'សាឡាត់',
  salad: 'សាឡាត់',
  soups: 'ស៊ុប',
  soup: 'ស៊ុប',
  desserts: 'បង្អែម',
  dessert: 'បង្អែម',
  drinks: 'ភេសជ្ជៈ',
  drink: 'ភេសជ្ជៈ',
  beverages: 'ភេសជ្ជៈ',
  beverage: 'ភេសជ្ជៈ',
  food: 'ម្ហូបអាហារ',
  snacks: 'អាហារសម្រន់',
  snack: 'អាហារសម្រន់',
  noodles: 'មី និងគុយទាវ',
  noodle: 'មី/គុយទាវ',
  coffee: 'កាហ្វេ',
  tea: 'តែ',
  bakery: 'នំប៉័ង និងនំខេក',
  pastry: 'នំផ្អែម',
  appetizers: 'ម្ហូបកូរមាត់',
  'main course': 'ម្ហូបចម្បង',
  sides: 'ម្ហូបបន្ទាប់បន្សំ',
  rice: 'បាយ',
  'fast food': 'អាហាររហ័ស',
  seafood: 'គ្រឿងសមុទ្រ',
  vegetarian: 'អាហារបួស',
  meat: 'សាច់',
  chicken: 'សាច់មាន់',
  beef: 'សាច់គោ',
  pork: 'សាច់ជ្រូក',
  alcohol: 'គ្រឿងស្រវឹង',
  beer: 'ស្រាបៀរ',
  wine: 'ស្រាទំពាំងបាយជូរ',
  juice: 'ទឹកផ្លែឈើ',
  cocktails: 'ស្រាក្រឡុក',
  'ice cream': 'ការ៉េម',
  cake: 'នំខេក',
  clothing: 'សម្លៀកបំពាក់',
  electronics: 'គ្រឿងអេឡិចត្រូនិច',
  cosmetics: 'គ្រឿងសម្អាង',
  retail: 'ទំនិញលក់រាយ',
  groceries: 'គ្រឿងទេស',
  all: 'ទាំងអស់',
  'all categories': 'ប្រភេទទាំងអស់',
  general: 'ទូទៅ',
  uncategorized: 'មិនទាន់កំណត់ប្រភេទ',
  'no category': 'គ្មានប្រភេទ',
};

export const CATEGORY_MAP_KH_TO_EN: Record<string, string> = {
  ភីហ្សា: 'Pizza',
  ប៊ឺហ្គឺ: 'Burgers',
  សាឡាត់: 'Salads',
  ស៊ុប: 'Soups',
  បង្អែម: 'Desserts',
  ភេសជ្ជៈ: 'Drinks',
  ម្ហូបអាហារ: 'Food',
  ម្ហូប: 'Food',
  អាហារសម្រន់: 'Snacks',
  'មី និងគុយទាវ': 'Noodles',
  មី: 'Noodles',
  គុយទាវ: 'Noodles',
  កាហ្វេ: 'Coffee',
  តែ: 'Tea',
  'នំប៉័ង និងនំខេក': 'Bakery',
  នំប៉័ង: 'Bakery',
  នំផ្អែម: 'Pastry',
  ម្ហូបកូរមាត់: 'Appetizers',
  ម្ហូបចម្បង: 'Main Course',
  ម្ហូបបន្ទាប់បន្សំ: 'Sides',
  បាយ: 'Rice',
  អាហាររហ័ស: 'Fast Food',
  គ្រឿងសមុទ្រ: 'Seafood',
  អាហារបួស: 'Vegetarian',
  សាច់: 'Meat',
  សាច់មាន់: 'Chicken',
  សាច់គោ: 'Beef',
  សាច់ជ្រូក: 'Pork',
  គ្រឿងស្រវឹង: 'Alcohol',
  ស្រាបៀរ: 'Beer',
  ស្រាទំពាំងបាយជូរ: 'Wine',
  ទឹកផ្លែឈើ: 'Juice',
  ស្រាក្រឡុក: 'Cocktails',
  ការ៉េម: 'Ice Cream',
  នំខេក: 'Cake',
  សម្លៀកបំពាក់: 'Clothing',
  គ្រឿងអេឡិចត្រូនិច: 'Electronics',
  គ្រឿងសម្អាង: 'Cosmetics',
  ទំនិញលក់រាយ: 'Retail',
  គ្រឿងទេស: 'Groceries',
  ទាំងអស់: 'All',
  ប្រភេទទាំងអស់: 'All Categories',
  ទូទៅ: 'General',
  មិនទាន់កំណត់ប្រភេទ: 'Uncategorized',
  គ្មានប្រភេទ: 'No category',
};

// Emoji extract regex (handles unicode emojis and variations)
const LEADING_EMOJI_REGEX = /^([\p{Emoji_Presentation}\p{Extended_Pictographic}][\ufe0f\u200d\s]*)/u;

/**
 * Extracts emoji and text part cleanly.
 */
export function separateEmojiAndText(raw: string): { emoji: string; text: string } {
  if (!raw) return { emoji: '', text: '' };
  const str = String(raw).trim();
  const match = str.match(LEADING_EMOJI_REGEX);
  if (match) {
    const emoji = match[1].trim();
    const text = str.slice(match[0].length).trim();
    return { emoji, text };
  }
  return { emoji: '', text: str };
}

/**
 * Strips emoji and brackets to get a clean text representation.
 */
export function cleanCategoryName(raw: string): string {
  if (!raw) return '';
  const { text } = separateEmojiAndText(raw);
  const match = text.match(/^(.*?)\s*[\(\[（](.*?)[\)\]）]\s*$/);
  if (match) {
    return (match[1] || match[2]).trim();
  }
  return text.trim();
}

/**
 * Localizes any category name cleanly between English and Khmer.
 * Supports:
 * - Leading emojis (re-attached if includeEmoji is true)
 * - Bracketed bilingual names (e.g. "Pizza (ភីហ្សា)")
 * - Bidirectional static category translations
 * - Custom names pass through cleanly
 */
export function localizeCategoryName(
  raw: any,
  isKhmer: boolean,
  includeEmoji: boolean = true
): string {
  if (!raw) return '';
  if (typeof raw === 'object') {
    if (isKhmer && raw.name_kh) return raw.name_kh;
    if (!isKhmer && raw.name_en) return raw.name_en;
    raw = raw.name || '';
  }

  const str = String(raw).trim();
  const { emoji, text } = separateEmojiAndText(str);

  // 1. Check bracketed patterns like "ភីហ្សា (Pizza)" or "Pizza [ភីហ្សា]"
  const bracketMatch = text.match(/^(.*?)\s*[\(\[（](.*?)[\)\]）]\s*$/);
  let baseText = text;
  if (bracketMatch) {
    const p1 = bracketMatch[1].trim();
    const p2 = bracketMatch[2].trim();
    const isKh1 = /[\u1780-\u17FF]/.test(p1);
    const isKh2 = /[\u1780-\u17FF]/.test(p2);
    if (isKhmer) {
      baseText = isKh1 ? p1 : isKh2 ? p2 : p1;
    } else {
      baseText = !isKh1 && /[a-zA-Z]/.test(p1) ? p1 : !isKh2 && /[a-zA-Z]/.test(p2) ? p2 : p1;
    }
  }

  // 2. Direct static map check
  const lower = baseText.toLowerCase().trim();
  let translated = baseText;

  if (isKhmer) {
    if (CATEGORY_MAP_EN_TO_KH[lower]) {
      translated = CATEGORY_MAP_EN_TO_KH[lower];
    } else {
      const fromI18n = translateString(baseText, 'kh');
      if (fromI18n && fromI18n !== baseText) {
        translated = fromI18n;
      }
    }
  } else {
    if (CATEGORY_MAP_KH_TO_EN[baseText]) {
      translated = CATEGORY_MAP_KH_TO_EN[baseText];
    } else if (CATEGORY_MAP_KH_TO_EN[lower]) {
      translated = CATEGORY_MAP_KH_TO_EN[lower];
    } else {
      const fromI18n = translateString(baseText, 'en');
      if (fromI18n && fromI18n !== baseText) {
        translated = fromI18n;
      }
    }
  }

  if (includeEmoji && emoji) {
    return `${emoji} ${translated}`.trim();
  }

  return translated;
}

/**
 * Get category emoji based on name or fallback.
 */
export function getCategoryEmoji(name: string): string {
  const n = (name || '').toLowerCase();
  const { emoji } = separateEmojiAndText(name);
  if (emoji) return emoji;

  if (n.includes('pizza') || n.includes('ភីហ្សា')) return '🍕';
  if (n.includes('burger') || n.includes('ប៊ឺហ្គឺ')) return '🍔';
  if (n.includes('salad') || n.includes('សាឡាត់')) return '🥗';
  if (n.includes('soup') || n.includes('ស៊ុប')) return '🍲';
  if (n.includes('dessert') || n.includes('cake') || n.includes('ice cream') || n.includes('បង្អែម') || n.includes('ការ៉េម')) return '🍰';
  if (n.includes('drink') || n.includes('beverage') || n.includes('coffee') || n.includes('tea') || n.includes('soda') || n.includes('ភេសជ្ជៈ') || n.includes('កាហ្វេ')) return '🥤';
  if (n.includes('food') || n.includes('rice') || n.includes('ម្ហូប') || n.includes('បាយ')) return '🍱';
  if (n.includes('snack') || n.includes('អាហារសម្រន់')) return '🍿';
  if (n.includes('noodle') || n.includes('មី') || n.includes('គុយទាវ')) return '🍜';
  return '🍽️';
}

/**
 * Get localized category description.
 */
export function getCategoryDescription(
  name: string,
  desc?: string,
  t?: (key: string, defaultVal?: string) => string
): string {
  const tr = (k: string, fallback: string) => (t ? t(k, fallback) : fallback);
  const n = (name || '').toLowerCase();

  // If desc is provided, check if it matches one of our known English or Khmer static descriptions
  if (desc && desc.trim()) {
    const dLower = desc.trim().toLowerCase();
    if (dLower.includes('stone-baked') || dLower.includes('ភីហ្សាដុត')) return tr('categories.descriptions.pizza', tr('restaurant.descPizza', 'Stone-baked pizzas in every size'));
    if (dLower.includes('handcrafted burgers') || dLower.includes('ប៊ឺហ្គឺរសជាតិ')) return tr('categories.descriptions.burger', tr('restaurant.descBurger', 'Handcrafted burgers and sliders'));
    if (dLower.includes('fresh salads') || dLower.includes('សាឡាត់បន្លែ')) return tr('categories.descriptions.salad', tr('restaurant.descSalad', 'Fresh salads with house dressings'));
    if (dLower.includes('warm soups') || dLower.includes('ស៊ុបក្ដៅ')) return tr('categories.descriptions.soup', tr('restaurant.descSoup', 'Warm soups made from scratch daily'));
    if (dLower.includes('sweet endings') || dLower.includes('បង្អែមឆ្ងាញ់')) return tr('categories.descriptions.dessert', tr('restaurant.descDessert', 'Sweet endings and indulgent treats'));
    if (dLower.includes('cold beverages') || dLower.includes('ភេសជ្ជៈត្រជាក់')) return tr('categories.descriptions.drink', tr('restaurant.descDrink', 'Cold beverages and fresh juices'));
    if (dLower.includes('authentic home-style') || dLower.includes('មុខម្ហូបរសជាតិដើម')) return tr('categories.descriptions.food', tr('restaurant.descFood', 'Authentic home-style cooked dishes'));
    if (dLower.includes('quick bites') || dLower.includes('អាហារសម្រន់ស្រួយ')) return tr('categories.descriptions.snack', tr('restaurant.descSnack', 'Quick bites and crispy appetizers'));
    if (dLower.includes('delicious selection') || dLower.includes('មុខម្ហូប និងភេសជ្ជៈ')) return tr('categories.descriptions.default', tr('restaurant.descDefault', 'Delicious selection of menu items'));
    return desc;
  }

  if (n.includes('pizza') || n.includes('ភីហ្សា')) return tr('categories.descriptions.pizza', tr('restaurant.descPizza', 'Stone-baked pizzas in every size'));
  if (n.includes('burger') || n.includes('ប៊ឺហ្គឺ')) return tr('categories.descriptions.burger', tr('restaurant.descBurger', 'Handcrafted burgers and sliders'));
  if (n.includes('salad') || n.includes('សាឡាត់')) return tr('categories.descriptions.salad', tr('restaurant.descSalad', 'Fresh salads with house dressings'));
  if (n.includes('soup') || n.includes('ស៊ុប')) return tr('categories.descriptions.soup', tr('restaurant.descSoup', 'Warm soups made from scratch daily'));
  if (n.includes('dessert') || n.includes('បង្អែម')) return tr('categories.descriptions.dessert', tr('restaurant.descDessert', 'Sweet endings and indulgent treats'));
  if (n.includes('drink') || n.includes('ភេសជ្ជៈ')) return tr('categories.descriptions.drink', tr('restaurant.descDrink', 'Cold beverages and fresh juices'));
  if (n.includes('food') || n.includes('ម្ហូប')) return tr('categories.descriptions.food', tr('restaurant.descFood', 'Authentic home-style cooked dishes'));
  if (n.includes('snack') || n.includes('អាហារសម្រន់')) return tr('categories.descriptions.snack', tr('restaurant.descSnack', 'Quick bites and crispy appetizers'));
  if (n.includes('noodle') || n.includes('មី') || n.includes('គុយទាវ')) return tr('categories.descriptions.noodle', 'Hearty noodles and aromatic broths');
  if (n.includes('coffee') || n.includes('កាហ្វេ')) return tr('categories.descriptions.coffee', 'Freshly brewed artisan coffees and espresso');
  if (n.includes('tea') || n.includes('តែ')) return tr('categories.descriptions.tea', 'Refreshing teas and traditional infusions');
  if (n.includes('bakery') || n.includes('នំប៉័ង')) return tr('categories.descriptions.bakery', 'Freshly baked pastries and artisan breads');
  return tr('categories.descriptions.default', tr('restaurant.descDefault', 'Delicious selection of menu items'));
}
