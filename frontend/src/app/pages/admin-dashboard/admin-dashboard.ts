import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Category, Discount, Product } from '../../core/catalog.model';
import { CatalogService } from '../../core/catalog.service';

type AdminTab = 'products' | 'categories' | 'discounts';
type DeleteKind = 'product' | 'category' | 'discount';

interface DeleteTarget {
  kind: DeleteKind;
  id: number;
  label: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  private readonly catalogService = inject(CatalogService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);

  protected readonly tab = signal<AdminTab>('products');
  protected readonly categories = signal<Category[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly discounts = signal<Discount[]>([]);
  protected readonly loading = signal(false);
  protected readonly message = signal('');
  protected readonly editingProductId = signal<number | null>(null);
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingDiscountId = signal<number | null>(null);
  protected readonly productModalOpen = signal(false);
  protected readonly categoryModalOpen = signal(false);
  protected readonly discountModalOpen = signal(false);
  protected readonly deleteTarget = signal<DeleteTarget | null>(null);
  protected productImage: File | null = null;
  protected editProductImage: File | null = null;

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    isActive: [true],
    position: [0],
  });

  protected readonly editCategoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    isActive: [true],
    position: [0],
  });

  protected readonly productForm = this.formBuilder.nonNullable.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(180)]],
    description: [''],
    sku: [''],
    careInstructions: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    position: [0],
  });

  protected readonly editProductForm = this.formBuilder.nonNullable.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(180)]],
    description: [''],
    sku: [''],
    careInstructions: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    position: [0],
  });

  protected readonly discountForm = this.formBuilder.nonNullable.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(160)]],
    percentage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    startsAt: [''],
    endsAt: [''],
    isActive: [true],
  });

  protected readonly editDiscountForm = this.formBuilder.nonNullable.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.maxLength(160)]],
    percentage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    startsAt: [''],
    endsAt: [''],
    isActive: [true],
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.message.set('');

    this.catalogService.categories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loadProducts();
      },
      error: () => {
        this.message.set('No se pudieron cargar las categorias.');
        this.loading.set(false);
      },
    });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.categoryForm.getRawValue();

    this.catalogService.createCategory(payload).subscribe({
      next: () => {
        this.resetCategoryForm();
        this.loadAll();
        this.message.set('Categoria creada.');
      },
      error: () => this.message.set('No se pudo guardar la categoria.'),
    });
  }

  editCategory(category: Category): void {
    this.tab.set('categories');
    this.editingCategoryId.set(category.id);
    this.editCategoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      isActive: Boolean(category.isActive),
      position: category.position,
    });
    this.categoryModalOpen.set(true);
  }

  saveCategoryEdit(): void {
    if (this.editCategoryForm.invalid || !this.editingCategoryId()) {
      this.editCategoryForm.markAllAsTouched();
      return;
    }

    this.catalogService.updateCategory(this.editingCategoryId()!, this.editCategoryForm.getRawValue()).subscribe({
      next: () => {
        this.closeModals();
        this.loadAll();
        this.message.set('Categoria actualizada.');
      },
      error: () => this.message.set('No se pudo actualizar la categoria.'),
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.productForm.getRawValue();
    const request = this.catalogService.createProduct(payload, this.productImage);

    request.subscribe({
      next: () => {
        this.resetProductForm();
        this.loadProducts();
        this.message.set('Producto guardado.');
      },
      error: () => {
        this.message.set('No se pudo guardar el producto.');
        this.loading.set(false);
      },
    });
  }

  editProduct(product: Product): void {
    this.tab.set('products');
    this.editingProductId.set(product.id);
    this.editProductImage = null;
    this.editProductForm.patchValue({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      careInstructions: product.careInstructions || '',
      price: Number(product.price),
      stock: product.stock,
      isActive: Boolean(product.isActive),
      position: product.position,
    });
    this.productModalOpen.set(true);
  }

  saveProductEdit(): void {
    if (this.editProductForm.invalid || !this.editingProductId()) {
      this.editProductForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.catalogService
      .updateProduct(this.editingProductId()!, this.editProductForm.getRawValue(), this.editProductImage)
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadProducts();
          this.message.set('Producto actualizado.');
        },
        error: () => {
          this.message.set('No se pudo actualizar el producto.');
          this.loading.set(false);
        },
      });
  }

  requestDeleteProduct(product: Product): void {
    this.deleteTarget.set({ kind: 'product', id: product.id, label: product.name });
  }

  requestDeleteCategory(category: Category): void {
    this.deleteTarget.set({ kind: 'category', id: category.id, label: category.name });
  }

  requestDeleteDiscount(discount: Discount): void {
    this.deleteTarget.set({ kind: 'discount', id: discount.id, label: discount.title });
  }

  confirmDelete(): void {
    const target = this.deleteTarget();

    if (!target) {
      return;
    }

    const request =
      target.kind === 'product'
        ? this.catalogService.deleteProduct(target.id)
        : target.kind === 'category'
          ? this.catalogService.deleteCategory(target.id)
          : this.catalogService.deleteDiscount(target.id);

    request.subscribe({
      next: () => {
        this.closeModals();
        target.kind === 'discount' ? this.loadDiscounts() : this.loadAll();
        this.message.set('Registro eliminado.');
      },
      error: () => this.message.set('No se pudo eliminar. Revisa si tiene datos asociados.'),
    });
  }

  saveDiscount(): void {
    if (this.discountForm.invalid) {
      this.discountForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.discountForm.getRawValue();
    const payload = {
      ...raw,
      startsAt: raw.startsAt || null,
      endsAt: raw.endsAt || null,
    };
    const request = this.catalogService.createDiscount(payload);

    request.subscribe({
      next: () => {
        this.resetDiscountForm();
        this.loadDiscounts();
        this.message.set('Descuento guardado.');
      },
      error: () => {
        this.message.set('No se pudo guardar el descuento.');
        this.loading.set(false);
      },
    });
  }

  editDiscount(discount: Discount): void {
    this.tab.set('discounts');
    this.editingDiscountId.set(discount.id);
    this.editDiscountForm.patchValue({
      productId: discount.productId,
      title: discount.title,
      percentage: discount.percentage,
      startsAt: this.toInputDate(discount.startsAt),
      endsAt: this.toInputDate(discount.endsAt),
      isActive: Boolean(discount.isActive),
    });
    this.discountModalOpen.set(true);
  }

  saveDiscountEdit(): void {
    if (this.editDiscountForm.invalid || !this.editingDiscountId()) {
      this.editDiscountForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.editDiscountForm.getRawValue();
    const payload = {
      ...raw,
      startsAt: raw.startsAt || null,
      endsAt: raw.endsAt || null,
    };

    this.catalogService.updateDiscount(this.editingDiscountId()!, payload).subscribe({
      next: () => {
        this.closeModals();
        this.loadDiscounts();
        this.message.set('Descuento actualizado.');
      },
      error: () => {
        this.message.set('No se pudo actualizar el descuento.');
        this.loading.set(false);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.productImage = input.files?.[0] || null;
  }

  onEditImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editProductImage = input.files?.[0] || null;
  }

  resetProductForm(): void {
    this.editingProductId.set(null);
    this.productImage = null;
    this.productForm.reset({
      categoryId: this.categories()[0]?.id || 0,
      name: '',
      description: '',
      sku: '',
      careInstructions: '',
      price: 0,
      stock: 0,
      isActive: true,
      position: 0,
    });
  }

  resetCategoryForm(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '', description: '', isActive: true, position: 0 });
  }

  closeModals(): void {
    this.productModalOpen.set(false);
    this.categoryModalOpen.set(false);
    this.discountModalOpen.set(false);
    this.deleteTarget.set(null);
    this.editingProductId.set(null);
    this.editingCategoryId.set(null);
    this.editingDiscountId.set(null);
    this.editProductImage = null;
  }

  resetDiscountForm(): void {
    this.editingDiscountId.set(null);
    this.discountForm.reset({
      productId: this.products()[0]?.id || 0,
      title: '',
      percentage: 10,
      startsAt: '',
      endsAt: '',
      isActive: true,
    });
  }

  private loadProducts(): void {
    this.catalogService.products().subscribe({
      next: (products) => {
        this.products.set(products);
        if (this.productForm.controls.categoryId.value === 0 && this.categories()[0]) {
          this.productForm.controls.categoryId.setValue(this.categories()[0].id);
        }
        this.loadDiscounts();
      },
      error: () => {
        this.message.set('No se pudieron cargar los productos.');
        this.loading.set(false);
      },
    });
  }

  private loadDiscounts(): void {
    this.catalogService.discounts().subscribe({
      next: (discounts) => {
        this.discounts.set(discounts);
        if (this.discountForm.controls.productId.value === 0 && this.products()[0]) {
          this.discountForm.controls.productId.setValue(this.products()[0].id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.message.set('No se pudieron cargar los descuentos.');
        this.loading.set(false);
      },
    });
  }

  private toInputDate(value: string | null): string {
    return value ? value.slice(0, 10) : '';
  }
}
