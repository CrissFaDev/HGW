import { RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db/pool';
import { deleteImage, UploadedImage, uploadImage } from '../services/cloudinary.service';

type SqlValue = string | number | null;

interface CategoryPayload {
  [key: string]: SqlValue;
  id: number | null;
  name: string;
  description: string | null;
  isActive: 0 | 1;
  position: number;
}

interface ProductPayload {
  [key: string]: SqlValue;
  id: number | null;
  categoryId: number;
  name: string;
  description: string | null;
  sku: string | null;
  careInstructions: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: 0 | 1;
  position: number;
}

interface DiscountPayload {
  [key: string]: SqlValue;
  id: number | null;
  productId: number;
  title: string;
  percentage: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: 0 | 1;
}

interface ImageRow extends RowDataPacket {
  imagePublicId: string | null;
}

const productSelect = `
  p.id,
  p.category_id AS categoryId,
  c.name AS categoryName,
  p.name,
  p.description,
  p.sku,
  p.care_instructions AS careInstructions,
  p.price,
  p.stock,
  p.image_url AS imageUrl,
  p.image_public_id AS imagePublicId,
  p.is_active AS isActive,
  p.position,
  p.created_at AS createdAt,
  p.updated_at AS updatedAt
`;

const discountSelect = `
  d.id,
  d.product_id AS productId,
  p.name AS productName,
  d.title,
  d.percentage,
  d.starts_at AS startsAt,
  d.ends_at AS endsAt,
  d.is_active AS isActive,
  ROUND(p.price - (p.price * d.percentage / 100), 2) AS finalPrice,
  d.created_at AS createdAt,
  d.updated_at AS updatedAt
`;

export const listPublicProducts: RequestHandler = async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        ${productSelect},
        d.id AS discountId,
        d.title AS discountTitle,
        d.percentage AS discountPercentage,
        ROUND(p.price - (p.price * d.percentage / 100), 2) AS discountPrice
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       LEFT JOIN discounts d
        ON d.product_id = p.id
        AND d.is_active = 1
        AND (d.starts_at IS NULL OR d.starts_at <= CURRENT_DATE())
        AND (d.ends_at IS NULL OR d.ends_at >= CURRENT_DATE())
       WHERE p.is_active = 1 AND c.is_active = 1
       ORDER BY c.position ASC, c.name ASC, p.position ASC, p.name ASC`,
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listCategories: RequestHandler = async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        name,
        description,
        is_active AS isActive,
        position,
        created_at AS createdAt,
        updated_at AS updatedAt
       FROM product_categories
       ORDER BY position ASC, name ASC`,
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createCategory: RequestHandler = async (req, res, next) => {
  try {
    const payload = categoryPayload(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO product_categories (name, description, is_active, position)
       VALUES (:name, :description, :isActive, :position)`,
      payload,
    );

    res.status(201).json({ ...payload, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updateCategory: RequestHandler = async (req, res, next) => {
  try {
    const payload = categoryPayload(req.body);
    payload.id = Number(req.params.id);

    await pool.execute(
      `UPDATE product_categories
       SET name = :name,
           description = :description,
           is_active = :isActive,
           position = :position
       WHERE id = :id`,
      payload,
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM product_categories WHERE id = :id', {
      id: Number(req.params.id),
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listProducts: RequestHandler = async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${productSelect}
       FROM products p
       INNER JOIN product_categories c ON c.id = p.category_id
       ORDER BY c.position ASC, p.position ASC, p.id DESC`,
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    let uploadedImage: UploadedImage | null = null;

    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, req.file.originalname);
    }

    const payload = productPayload(req.body, uploadedImage);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO products
        (category_id, name, description, sku, care_instructions, price, stock, image_url, image_public_id, is_active, position)
       VALUES
        (:categoryId, :name, :description, :sku, :careInstructions, :price, :stock, :imageUrl, :imagePublicId, :isActive, :position)`,
      payload,
    );

    res.status(201).json({ ...payload, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = Number(req.params.id);
    const [[existing]] = await connection.execute<ImageRow[]>(
      'SELECT image_public_id AS imagePublicId FROM products WHERE id = :id FOR UPDATE',
      { id },
    );

    if (!existing) {
      await connection.rollback();
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }

    let uploadedImage: UploadedImage | null = null;

    if (req.file) {
      uploadedImage = await uploadImage(req.file.buffer, req.file.originalname);
    }

    const payload = productPayload(req.body, uploadedImage);
    payload.id = id;

    await connection.execute(
      `UPDATE products
       SET category_id = :categoryId,
           name = :name,
           description = :description,
           sku = :sku,
           care_instructions = :careInstructions,
           price = :price,
           stock = :stock,
           image_url = COALESCE(:imageUrl, image_url),
           image_public_id = COALESCE(:imagePublicId, image_public_id),
           is_active = :isActive,
           position = :position
       WHERE id = :id`,
      payload,
    );

    await connection.commit();

    if (uploadedImage && existing.imagePublicId) {
      await deleteImage(existing.imagePublicId);
    }

    res.json(payload);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const id = Number(req.params.id);
    const [[existing]] = await connection.execute<ImageRow[]>(
      'SELECT image_public_id AS imagePublicId FROM products WHERE id = :id FOR UPDATE',
      { id },
    );

    if (!existing) {
      await connection.rollback();
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }

    await connection.execute('DELETE FROM products WHERE id = :id', { id });
    await connection.commit();

    if (existing.imagePublicId) {
      await deleteImage(existing.imagePublicId);
    }

    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const listDiscounts: RequestHandler = async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${discountSelect}
       FROM discounts d
       INNER JOIN products p ON p.id = d.product_id
       ORDER BY d.created_at DESC`,
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createDiscount: RequestHandler = async (req, res, next) => {
  try {
    const payload = discountPayload(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO discounts (product_id, title, percentage, starts_at, ends_at, is_active)
       VALUES (:productId, :title, :percentage, :startsAt, :endsAt, :isActive)`,
      payload,
    );

    res.status(201).json({ ...payload, id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updateDiscount: RequestHandler = async (req, res, next) => {
  try {
    const payload = discountPayload(req.body);
    payload.id = Number(req.params.id);

    await pool.execute(
      `UPDATE discounts
       SET product_id = :productId,
           title = :title,
           percentage = :percentage,
           starts_at = :startsAt,
           ends_at = :endsAt,
           is_active = :isActive
       WHERE id = :id`,
      payload,
    );

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const deleteDiscount: RequestHandler = async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM discounts WHERE id = :id', {
      id: Number(req.params.id),
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

function categoryPayload(body: Record<string, unknown>): CategoryPayload {
  return {
    id: null,
    name: stringOrDefault(body.name, ''),
    description: stringOrNull(body.description),
    isActive: toBooleanNumber(body.isActive),
    position: numberOrDefault(body.position, 0),
  };
}

function productPayload(body: Record<string, unknown>, uploadedImage: UploadedImage | null): ProductPayload {
  return {
    id: null,
    categoryId: numberOrDefault(body.categoryId, 0),
    name: stringOrDefault(body.name, ''),
    description: stringOrNull(body.description),
    sku: stringOrNull(body.sku),
    careInstructions: stringOrNull(body.careInstructions),
    price: numberOrDefault(body.price, 0),
    stock: numberOrDefault(body.stock, 0),
    imageUrl: uploadedImage?.url || null,
    imagePublicId: uploadedImage?.publicId || null,
    isActive: toBooleanNumber(body.isActive),
    position: numberOrDefault(body.position, 0),
  };
}

function discountPayload(body: Record<string, unknown>): DiscountPayload {
  return {
    id: null,
    productId: numberOrDefault(body.productId, 0),
    title: stringOrDefault(body.title, ''),
    percentage: clamp(numberOrDefault(body.percentage, 0), 1, 100),
    startsAt: stringOrNull(body.startsAt),
    endsAt: stringOrNull(body.endsAt),
    isActive: toBooleanNumber(body.isActive),
  };
}

function stringOrDefault(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberOrDefault(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBooleanNumber(value: unknown): 0 | 1 {
  if (value === false || value === 'false' || value === '0' || value === 0) {
    return 0;
  }

  return 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
