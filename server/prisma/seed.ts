import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Consistent portrait crop for a cohesive lookbook feel.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&crop=entropy&q=80&auto=format`;

type Seed = {
  name: string;
  description: string;
  price: number; // cents
  category: string;
  image: string;
  sizes: string;
  featured?: boolean;
};

const products: Seed[] = [
  // --- Men ---
  {
    name: "Essential Cotton Tee",
    description:
      "A wardrobe cornerstone cut from heavyweight 220gsm organic cotton with a clean crew neck and a relaxed, everyday fit.",
    price: 2800,
    category: "Men",
    image: img("1521572163474-6864f9cf17ab"),
    sizes: "S,M,L,XL,XXL",
    featured: true,
  },
  {
    name: "Merino Wool Sweater",
    description:
      "Lightweight yet warm, this fine-gauge merino knit breathes naturally and layers effortlessly from desk to dinner.",
    price: 8900,
    category: "Men",
    image: img("1552374196-c4e7ffc6e126"),
    sizes: "S,M,L,XL",
  },
  {
    name: "Selvedge Denim Jeans",
    description:
      "Raw 13.5oz Japanese selvedge denim with a straight leg and a mid-rise waist that ages beautifully with wear.",
    price: 11800,
    category: "Men",
    image: img("1490481651871-ab68de25d43d"),
    sizes: "30,32,34,36,38",
  },
  {
    name: "Overshirt Jacket",
    description:
      "A brushed cotton-twill overshirt that works as a light jacket or heavy shirt. Two chest pockets, corozo buttons.",
    price: 14500,
    category: "Men",
    image: img("1434389677669-e08b4cac3105"),
    sizes: "S,M,L,XL",
    featured: true,
  },
  {
    name: "Classic Oxford Shirt",
    description:
      "Timeless button-down in soft Oxford cotton with a tailored-but-comfortable cut. Wear it crisp or lived-in.",
    price: 6800,
    category: "Men",
    image: img("1503341504253-dff4815485f1"),
    sizes: "S,M,L,XL",
  },
  {
    name: "Heavyweight Hoodie",
    description:
      "Ultra-soft 450gsm fleece with a double-layer hood and ribbed cuffs. The one you'll reach for all winter.",
    price: 7500,
    category: "Men",
    image: img("1583743814966-8936f5b7be1a"),
    sizes: "S,M,L,XL,XXL",
  },

  // --- Women ---
  {
    name: "Relaxed Linen Shirt",
    description:
      "Breezy European linen with a drapey silhouette and a fold-back cuff. Effortless from beach to boulevard.",
    price: 7200,
    category: "Women",
    image: img("1576566588028-4147f3842f27"),
    sizes: "XS,S,M,L",
  },
  {
    name: "Ribbed Knit Dress",
    description:
      "A body-skimming ribbed midi dress in a stretch-cotton blend. Sculpted, comfortable, and endlessly versatile.",
    price: 9800,
    category: "Women",
    image: img("1594633312681-425c7b97ccd1"),
    sizes: "XS,S,M,L",
    featured: true,
  },
  {
    name: "High-Rise Wide Jeans",
    description:
      "Rigid organic-cotton denim with a high waist and a fluid wide leg. A modern, elongating everyday jean.",
    price: 11000,
    category: "Women",
    image: img("1489987707025-afc232f7ea0f"),
    sizes: "24,26,28,30,32",
  },
  {
    name: "Oversized Blazer",
    description:
      "A relaxed, single-breasted blazer in a wool-blend suiting. Padded shoulders, welt pockets, sharp lapels.",
    price: 16500,
    category: "Women",
    image: img("1551232864-3f0890e580d9"),
    sizes: "XS,S,M,L",
  },
  {
    name: "Cropped Cardigan",
    description:
      "A fine-knit cropped cardigan with mother-of-pearl buttons. Button it up or layer it open over a tee.",
    price: 8400,
    category: "Women",
    image: img("1571945153237-4929e783af4a"),
    sizes: "XS,S,M,L",
  },
  {
    name: "Pleated Midi Skirt",
    description:
      "Knife-pleated and fluid, this midi skirt moves with you and pairs as easily with sneakers as with heels.",
    price: 7900,
    category: "Women",
    image: img("1596755094514-f87e34085b2c"),
    sizes: "XS,S,M,L",
  },

  // --- Accessories ---
  {
    name: "Leather Weekender Bag",
    description:
      "Full-grain leather holdall with a roomy main compartment, brass hardware, and a detachable shoulder strap.",
    price: 21000,
    category: "Accessories",
    image: img("1560243563-062bfc001d68"),
    sizes: "One Size",
  },
  {
    name: "Canvas Low-Top Sneakers",
    description:
      "Clean, minimal low-tops in heavyweight canvas on a vulcanized rubber sole. Goes with absolutely everything.",
    price: 9500,
    category: "Accessories",
    image: img("1556905055-8f358a7a47b2"),
    sizes: "7,8,9,10,11,12",
    featured: true,
  },
  {
    name: "Acetate Sunglasses",
    description:
      "Hand-polished acetate frames with UV400 polarized lenses and a keyhole bridge. Comes with a felt-lined case.",
    price: 5800,
    category: "Accessories",
    image: img("1547949003-9792a18a2601"),
    sizes: "One Size",
  },
  {
    name: "Wool Beanie",
    description:
      "A snug, ribbed beanie knit from lambswool. Warm, itch-free, and finished with a subtle woven label.",
    price: 3200,
    category: "Accessories",
    image: img("1608234808654-2a8875faa7fd"),
    sizes: "One Size",
  },
];

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Catalog already has ${existing} products — skipping seed ✔`);
    return;
  }

  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`Seed complete ✔ (${products.length} products created)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
