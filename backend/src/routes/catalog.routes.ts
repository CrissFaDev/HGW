import { Router } from 'express';
import { body, param, ValidationChain } from 'express-validator';
import {
  createCategory,
  createDiscount,
  createProduct,
  deleteCategory,
  deleteDiscount,
  deleteProduct,
  listCategories,
  listDiscounts,
  listProducts,
  listPublicProducts,
  updateCategory,
  updateDiscount,
  updateProduct,
} from '../controllers/catalog.controller';
import { requireAuth } from '../middleware/auth.middleware';
import upload from '../middleware/upload';
import validateRequest from '../middleware/validateRequest';

const router = Router();

const idParam = [param('id').isInt({ min: 1 }).toInt()];

const categoryRules: ValidationChain[] = [
  body('name').isLength({ min: 1, max: 120 }).trim(),
  body('description').optional({ nullable: true }).isLength({ max: 500 }).trim(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('position').optional().isInt({ min: 0 }).toInt(),
];

const productRules: ValidationChain[] = [
  body('categoryId').isInt({ min: 1 }).toInt(),
  body('name').isLength({ min: 1, max: 180 }).trim(),
  body('description').optional({ nullable: true }).isLength({ max: 5000 }).trim(),
  body('sku').optional({ nullable: true }).isLength({ max: 80 }).trim(),
  body('careInstructions').optional({ nullable: true }).isLength({ max: 500 }).trim(),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
  body('position').optional().isInt({ min: 0 }).toInt(),
];

const discountRules: ValidationChain[] = [
  body('productId').isInt({ min: 1 }).toInt(),
  body('title').isLength({ min: 1, max: 160 }).trim(),
  body('percentage').isInt({ min: 1, max: 100 }).toInt(),
  body('startsAt').optional({ nullable: true }).isISO8601(),
  body('endsAt').optional({ nullable: true }).isISO8601(),
  body('isActive').optional().isBoolean().toBoolean(),
];

router.get('/public/products', listPublicProducts);

router.get('/admin/categories', requireAuth, listCategories);
router.post('/admin/categories', requireAuth, categoryRules, validateRequest, createCategory);
router.patch('/admin/categories/:id', requireAuth, idParam, categoryRules, validateRequest, updateCategory);
router.delete('/admin/categories/:id', requireAuth, idParam, validateRequest, deleteCategory);

router.get('/admin/products', requireAuth, listProducts);
router.post('/admin/products', requireAuth, upload.single('image'), productRules, validateRequest, createProduct);
router.patch(
  '/admin/products/:id',
  requireAuth,
  upload.single('image'),
  idParam,
  productRules,
  validateRequest,
  updateProduct,
);
router.delete('/admin/products/:id', requireAuth, idParam, validateRequest, deleteProduct);

router.get('/admin/discounts', requireAuth, listDiscounts);
router.post('/admin/discounts', requireAuth, discountRules, validateRequest, createDiscount);
router.patch('/admin/discounts/:id', requireAuth, idParam, discountRules, validateRequest, updateDiscount);
router.delete('/admin/discounts/:id', requireAuth, idParam, validateRequest, deleteDiscount);

export default router;
