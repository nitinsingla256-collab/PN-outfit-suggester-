export const WARDROBE_TAXONOMY: Record<string, string[]> = {
  'Tops': ['Shirt', 'T-shirt', 'Polo', 'Blouse', 'Sweater', 'Cardigan', 'Hoodie', 'Tank Top', 'Turtleneck'],
  'Bottoms': ['Trousers', 'Chinos', 'Jeans', 'Shorts', 'Skirt'],
  'Dresses': ['Dress'],
  'Outerwear': ['Blazer', 'Suit Jacket', 'Jacket', 'Coat', 'Trench Coat', 'Overcoat', 'Puffer', 'Bomber', 'Leather Jacket'],
  'Footwear': ['Sneakers', 'Loafers', 'Derby Shoes', 'Oxford Shoes', 'Boots', 'Chelsea Boots', 'Sandals', 'Slides', 'Formal Shoes'],
  'Bags': ['Backpack', 'Tote', 'Briefcase', 'Crossbody', 'Shoulder Bag', 'Clutch', 'Duffle'],
  'Accessories': ['Sunglasses', 'Belt', 'Watch', 'Scarf', 'Hat', 'Cap', 'Tie', 'Pocket Square', 'Gloves', 'Other Accessory'],
  'Jewelry': ['Ring', 'Bracelet', 'Necklace', 'Earrings', 'Cufflinks'],
  'Activewear': ['Sports Top', 'Sports Bottom', 'Track Pants', 'Training Shorts', 'Sports Shoes'],
  'Formalwear': ['Suit', 'Tuxedo', 'Formal Shirt', 'Waistcoat', 'Formal Trousers'],
};

export function validateAndFixCategory(type: string, category: string): string {
  // If the type belongs to a specific category, force it.
  for (const [cat, types] of Object.entries(WARDROBE_TAXONOMY)) {
    if (types.some(t => t.toLowerCase() === type.toLowerCase())) {
      return cat;
    }
  }

  // Common aliases
  const t = type.toLowerCase();
  if (t.includes('shoe') || t.includes('boot') || t.includes('sneaker') || t.includes('loafer')) return 'Footwear';
  if (t.includes('shirt') || t.includes('top') || t.includes('sweater')) return 'Tops';
  if (t.includes('pant') || t.includes('jean') || t.includes('trouser') || t.includes('chino') || t.includes('short')) return 'Bottoms';
  if (t.includes('sunglass') || t.includes('watch') || t.includes('belt')) return 'Accessories';
  if (t.includes('bag') || t.includes('backpack')) return 'Bags';
  if (t.includes('jacket') || t.includes('coat') || t.includes('blazer')) return 'Outerwear';
  if (t.includes('dress')) return 'Dresses';
  if (t.includes('suit')) return 'Formalwear';

  return category;
}
