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
    name: 'Bebidas funcionales',
    description: 'Cafes, bebidas y mezclas funcionales del catalogo HGW.',
    position: 1,
  },
  {
    name: 'Cuidado personal',
    description: 'Productos para higiene, cuidado corporal y rutina diaria.',
    position: 2,
  },
  {
    name: 'Bienestar digestivo',
    description: 'Referencias orientadas al bienestar diario y consumo practico.',
    position: 3,
  },
  {
    name: 'Cuidado femenino',
    description: 'Productos de higiene femenina y proteccion diaria.',
    position: 4,
  },
  {
    name: 'Hogar y tecnologia de bienestar',
    description: 'Equipos y productos de apoyo para uso domestico.',
    position: 5,
  },
];

const products: SeedProduct[] = [
  {
    categoryName: 'Bebidas funcionales',
    name: 'Blueberry Soybean Milk Drink',
    description:
      'Bebida de soya con arandano del catalogo HGW, pensada para acompanar rutinas de bienestar y consumo diario.',
    sku: 'HGW-BLUEBERRY-SOYBEAN',
    careInstructions: 'Conservar cerrado, seco y protegido del calor. Revisar indicaciones del empaque.',
    price: 52000,
    stock: 12,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974585/pag-hgw/blueberry-soybean-milk-drink.jpg',
    imagePublicId: 'pag-hgw/blueberry-soybean-milk-drink',
    position: 1,
  },
  {
    categoryName: 'Bebidas funcionales',
    name: 'Berry Coffee',
    description:
      'Cafe funcional con enfoque antioxidante y de bienestar, ideal para consultar disponibilidad con asesoria directa.',
    sku: 'HGW-BERRY-COFFEE',
    careInstructions: 'Guardar en lugar seco, fresco y alejado de la luz directa.',
    price: 45000,
    stock: 15,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974592/pag-hgw/berry-coffee.jpg',
    imagePublicId: 'pag-hgw/berry-coffee',
    position: 2,
  },
  {
    categoryName: 'Bebidas funcionales',
    name: 'Ganoderma Soluble Coffee',
    description:
      'Cafe soluble con ganoderma para quienes buscan una referencia funcional dentro del portafolio HGW.',
    sku: 'HGW-GANODERMA-COFFEE',
    careInstructions: 'Mantener sellado y protegido de humedad. Preparar segun indicaciones.',
    price: 48000,
    stock: 14,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974593/pag-hgw/ganoderma-soluble-coffee.jpg',
    imagePublicId: 'pag-hgw/ganoderma-soluble-coffee',
    position: 3,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Kit Smilife Blueberry',
    description: 'Kit facial Blueberry con presentaciones para limpieza, hidratacion y cuidado de la piel.',
    sku: 'HGW-KIT-SMILIFE-BLUEBERRY',
    careInstructions: 'Usar segun indicaciones del empaque. Evitar contacto directo con ojos.',
    price: 68000,
    stock: 8,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974587/pag-hgw/kit-smilife-blueberry.jpg',
    imagePublicId: 'pag-hgw/kit-smilife-blueberry',
    position: 1,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Jabon de Turmalina HGW',
    description:
      'Jabon de turmalina para limpieza corporal y cuidado personal diario, con presentacion en barra.',
    sku: 'HGW-TOURMALINE-SOAP',
    careInstructions: 'Conservar seco despues de cada uso. Evitar contacto directo con ojos.',
    price: 22000,
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974588/pag-hgw/jabon-tourmalina.jpg',
    imagePublicId: 'pag-hgw/jabon-tourmalina',
    position: 2,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Olive Soap HGW',
    description:
      'Jabon de oliva para complementar la rutina de higiene, suavidad y cuidado cotidiano de la piel.',
    sku: 'HGW-OLIVE-SOAP',
    careInstructions: 'Conservar seco despues de cada uso.',
    price: 18000,
    stock: 30,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974590/pag-hgw/olive-soap.jpg',
    imagePublicId: 'pag-hgw/olive-soap',
    position: 3,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Herbs Toothpaste',
    description:
      'Crema dental herbal para higiene bucal diaria, con enfoque natural dentro de la linea HGW.',
    sku: 'HGW-HERBS-TOOTHPASTE',
    careInstructions: 'Mantener en lugar fresco y seco. No ingerir.',
    price: 28000,
    stock: 20,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974590/pag-hgw/herbs-toothpaste.jpg',
    imagePublicId: 'pag-hgw/herbs-toothpaste',
    position: 4,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Smilife Keratin Shampoo',
    description:
      'Shampoo con keratina para limpieza capilar y acompanamiento de rutinas de cuidado del cabello.',
    sku: 'HGW-SMILIFE-KERATIN-SHAMPOO',
    careInstructions: 'Aplicar sobre cabello humedo y enjuagar con abundante agua.',
    price: 36000,
    stock: 16,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974591/pag-hgw/smilife-keratin-shampoo.jpg',
    imagePublicId: 'pag-hgw/smilife-keratin-shampoo',
    position: 5,
  },
  {
    categoryName: 'Cuidado personal',
    name: 'Smilife Tourmaline Shower Gel',
    description:
      'Gel de ducha de turmalina para limpieza corporal, frescura y cuidado personal en uso diario.',
    sku: 'HGW-SMILIFE-TOURMALINE-GEL',
    careInstructions: 'Uso externo. Enjuagar con abundante agua.',
    price: 39000,
    stock: 14,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974592/pag-hgw/smilife-tourmaline-shower-gel.jpg',
    imagePublicId: 'pag-hgw/smilife-tourmaline-shower-gel',
    position: 6,
  },
  {
    categoryName: 'Bienestar digestivo',
    name: 'Blueberry Protect',
    description: 'Referencia Blueberry Protect del catalogo HGW para consultar con asesoria personalizada.',
    sku: 'HGW-BLUEBERRY-PROTECT',
    careInstructions: 'Seguir indicaciones del empaque. Mantener fuera del alcance de ninos.',
    price: 55000,
    stock: 10,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974585/pag-hgw/blueberry-protect.jpg',
    imagePublicId: 'pag-hgw/blueberry-protect',
    position: 1,
  },
  {
    categoryName: 'Bienestar digestivo',
    name: 'Lactiberry',
    description: 'Producto funcional HGW asociado a rutinas de bienestar digestivo y consumo responsable.',
    sku: 'HGW-LACTIBERRY',
    careInstructions: 'Conservar en lugar fresco y seco. Revisar indicaciones de uso.',
    price: 50000,
    stock: 11,
    imageUrl: 'https://res.cloudinary.com/rmbcejer/image/upload/v1783974588/pag-hgw/lactiberry.jpg',
    imagePublicId: 'pag-hgw/lactiberry',
    position: 2,
  },
  {
    categoryName: 'Cuidado femenino',
    name: 'Toallas Sanitarias Anion y Turmalina',
    description: 'Toallas sanitarias con anion y turmalina para higiene femenina y proteccion diaria.',
    sku: 'HGW-TOALLAS-ANION-TURMALINA',
    careInstructions: 'Mantener en empaque cerrado y en lugar seco hasta su uso.',
    price: 24000,
    stock: 24,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974589/pag-hgw/toallas-sanitarias-anion-turmalina.jpg',
    imagePublicId: 'pag-hgw/toallas-sanitarias-anion-turmalina',
    position: 1,
  },
  {
    categoryName: 'Hogar y tecnologia de bienestar',
    name: 'Waterson Termo de Turmalina',
    description: 'Termo alcalinizador con turmalina para uso diario en casa, trabajo o viajes.',
    sku: 'HGW-WATERSON-TERMO',
    careInstructions: 'Lavar antes de usar. No exponer a golpes fuertes ni temperaturas extremas.',
    price: 85000,
    stock: 6,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974586/pag-hgw/waterson-termo-turmalina.jpg',
    imagePublicId: 'pag-hgw/waterson-termo-turmalina',
    position: 1,
  },
  {
    categoryName: 'Hogar y tecnologia de bienestar',
    name: 'Ozono Digital para Uso Domestico',
    description:
      'Equipo de ozono digital para uso domestico, orientado a procesos de limpieza y apoyo en el hogar.',
    sku: 'HGW-OZONO-DIGITAL',
    careInstructions: 'Usar solo segun instrucciones del equipo y con ventilacion adecuada.',
    price: 165000,
    stock: 4,
    imageUrl:
      'https://res.cloudinary.com/rmbcejer/image/upload/v1783974593/pag-hgw/ozono-digital-domestico.jpg',
    imagePublicId: 'pag-hgw/ozono-digital-domestico',
    position: 2,
  },
];

async function seedProducts(): Promise<void> {
  const categoryIds = new Map<string, number>();
  const activeCategoryNames = categories.map((category) => category.name);
  const activeSkus = products.map((product) => product.sku);

  await pool.query(
    `UPDATE product_categories
     SET is_active = 0
     WHERE name NOT IN (${activeCategoryNames.map(() => '?').join(', ')})`,
    activeCategoryNames,
  );

  await pool.query(
    `UPDATE products
     SET is_active = 0
     WHERE sku LIKE 'HGW-%'
       AND sku NOT IN (${activeSkus.map(() => '?').join(', ')})`,
    activeSkus,
  );

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
    sku: 'HGW-GANODERMA-COFFEE',
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
