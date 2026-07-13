import 'dotenv/config';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from './pool';

interface IdRow extends RowDataPacket {
  id: number;
}

interface SeedProduct {
  categoryName: string;
  name: string;
  description: string;
  sku: string;
  careInstructions: string;
  price: number;
  stock: number;
  imageUrl: string;
  imagePublicId: string;
  position: number;
}

const categories = [
  {
    name: 'Cuidado personal',
    description: 'Higiene diaria y cuidado corporal.',
    position: 1,
  },
  {
    name: 'Alimentos funcionales',
    description: 'Bebidas, caramelos y complementos de bienestar.',
    position: 2,
  },
  {
    name: 'Bienestar diario',
    description: 'Productos de uso cotidiano asociados al bienestar.',
    position: 3,
  },
];

const products: SeedProduct[] = [
  {
    categoryName: 'Cuidado personal',
    name: 'Olive Soap HGW',
    description: 'Jabon de oliva para complementar la rutina de higiene y cuidado de la piel.',
    sku: 'HGW-OLIVE-SOAP',
    careInstructions: 'Conservar seco despues de cada uso.',
    price: 18000,
    stock: 30,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783964746/pag-hgw/hgw-olive-soap-1783964746143.jpg',
    imagePublicId: 'pag-hgw/hgw-olive-soap-1783964746143',
    position: 2,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Tourmaline Soap HGW',
    description: 'Jabon de turmalina HGW para cuidado personal y limpieza diaria.',
    sku: 'HGW-TOURMALINE-SOAP',
    careInstructions: 'Evitar contacto directo con ojos.',
    price: 22000,
    stock: 25,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783964747/pag-hgw/hgw-tourmaline-soap-1783964747280.jpg',
    imagePublicId: 'pag-hgw/hgw-tourmaline-soap-1783964747280',
    position: 3,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Aloe Vera Shampoo HGW',
    description:
      'Shampoo con aloe vera para acompanar la limpieza capilar y la sensacion de frescura natural.',
    sku: 'HGW-ALOE-SHAMPOO',
    careInstructions: 'Aplicar sobre cabello humedo y enjuagar con abundante agua.',
    price: 36000,
    stock: 16,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783965464/pag-hgw/hgw-aloe-shampoo-1783965463500.jpg',
    imagePublicId: 'pag-hgw/hgw-aloe-shampoo-1783965463500',
    position: 4,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Herbal Body Lotion HGW',
    description:
      'Locion corporal herbal para complementar rutinas de hidratacion y cuidado diario de la piel.',
    sku: 'HGW-HERBAL-LOTION',
    careInstructions: 'Usar sobre piel limpia. Mantener en lugar fresco.',
    price: 39000,
    stock: 14,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783965465/pag-hgw/hgw-herbal-lotion-1783965464614.jpg',
    imagePublicId: 'pag-hgw/hgw-herbal-lotion-1783965464614',
    position: 5,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Green Tea Cleanser HGW',
    description: 'Limpiador facial con enfoque natural para uso diario y sensacion de piel fresca.',
    sku: 'HGW-GREEN-TEA-CLEANSER',
    careInstructions: 'Evitar contacto directo con ojos. Suspender si presenta irritacion.',
    price: 34000,
    stock: 12,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783965493/pag-hgw/hgw-green-tea-cleanser-1783965492419.jpg',
    imagePublicId: 'pag-hgw/hgw-green-tea-cleanser-1783965492419',
    position: 6,
  },
  {
    categoryName: 'Alimentos funcionales',
    name: 'Blueberry Candy HGW',
    description: 'Caramelos de arandano HGW asociados a la linea de bienestar y consumo diario.',
    sku: 'HGW-BLUEBERRY-CANDY',
    careInstructions: 'Mantener cerrado y protegido del calor.',
    price: 32000,
    stock: 18,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783964749/pag-hgw/hgw-blueberry-candy-1783964747855.jpg',
    imagePublicId: 'pag-hgw/hgw-blueberry-candy-1783964747855',
    position: 1,
  },
  {
    categoryName: 'Alimentos funcionales',
    name: 'Green World Coffee HGW',
    description: 'Cafe funcional HGW para acompanar la rutina diaria.',
    sku: 'HGW-COFFEE',
    careInstructions: 'Guardar en lugar seco, fresco y alejado de la luz directa.',
    price: 45000,
    stock: 15,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783964749/pag-hgw/hgw-coffee-1783964749512.jpg',
    imagePublicId: 'pag-hgw/hgw-coffee-1783964749512',
    position: 2,
  },
];

async function seedProducts(): Promise<void> {
  const categoryIds = new Map<string, number>();

  for (const category of categories) {
    await pool.execute(
      `INSERT INTO product_categories (name, description, is_active, position)
       VALUES (:name, :description, 1, :position)
       ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        is_active = VALUES(is_active),
        position = VALUES(position)`,
      category,
    );

    const [[row]] = await pool.execute<IdRow[]>(
      'SELECT id FROM product_categories WHERE name = :name',
      { name: category.name },
    );
    categoryIds.set(category.name, row.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.categoryName);

    if (!categoryId) {
      throw new Error(`Category not found: ${product.categoryName}`);
    }

    const payload = {
      ...product,
      categoryId,
    };

    const [[existing]] = await pool.execute<IdRow[]>('SELECT id FROM products WHERE sku = :sku', {
      sku: product.sku,
    });

    if (existing) {
      await pool.execute(
        `UPDATE products
         SET category_id = :categoryId,
             name = :name,
             description = :description,
             care_instructions = :careInstructions,
             price = :price,
             stock = :stock,
             image_url = :imageUrl,
             image_public_id = :imagePublicId,
             is_active = 1,
             position = :position
         WHERE id = :id`,
        {
          ...payload,
          id: existing.id,
        },
      );
      continue;
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO products
        (category_id, name, description, sku, care_instructions, price, stock, image_url, image_public_id, is_active, position)
       VALUES
        (:categoryId, :name, :description, :sku, :careInstructions, :price, :stock, :imageUrl, :imagePublicId, 1, :position)`,
      payload,
    );
  }

  const [[coffee]] = await pool.execute<IdRow[]>('SELECT id FROM products WHERE sku = :sku', {
    sku: 'HGW-COFFEE',
  });

  if (coffee) {
    const [[existingDiscount]] = await pool.execute<IdRow[]>(
      'SELECT id FROM discounts WHERE product_id = :productId AND title = :title',
      {
        productId: coffee.id,
        title: 'Promocion bienestar',
      },
    );

    if (existingDiscount) {
      await pool.execute(
        `UPDATE discounts
         SET percentage = 10,
             starts_at = NULL,
             ends_at = NULL,
             is_active = 1
         WHERE id = :id`,
        { id: existingDiscount.id },
      );
    } else {
      await pool.execute(
        `INSERT INTO discounts (product_id, title, percentage, starts_at, ends_at, is_active)
         VALUES (:productId, :title, 10, NULL, NULL, 1)`,
        {
          productId: coffee.id,
          title: 'Promocion bienestar',
        },
      );
    }
  }

  await pool.end();
  console.log(`Seed complete: ${categories.length} categories, ${products.length} products.`);
}

seedProducts().catch(async (error) => {
  await pool.end();
  console.error(error);
  process.exit(1);
});
