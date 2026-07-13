import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Product } from '../../core/catalog.model';
import { CatalogService } from '../../core/catalog.service';

@Component({
  selector: 'app-products-page',
  imports: [CommonModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.scss',
})
export class ProductsPage {
  private readonly catalogService = inject(CatalogService);
  private readonly whatsappNumber = '573209609091';
  private readonly pageSize = 4;

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly categoryPages = signal<Record<string, number>>({});

  protected readonly groupedProducts = computed(() => {
    const groups = new Map<string, Product[]>();

    this.products().forEach((product) => {
      const group = product.categoryName || 'Sin categoria';
      groups.set(group, [...(groups.get(group) || []), product]);
    });

    return Array.from(groups.entries()).map(([category, products]) => ({ category, products }));
  });

  constructor() {
    this.catalogService.publicProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catalogo.');
        this.loading.set(false);
      },
    });
  }

  protected whatsappLink(product: Product): string {
    const message = `Hola Lucy, quiero informacion del producto ${product.name} de HGW.`;
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  protected currentPage(category: string): number {
    return this.categoryPages()[category] || 1;
  }

  protected totalPages(products: Product[]): number {
    return Math.max(1, Math.ceil(products.length / this.pageSize));
  }

  protected visibleProducts(category: string, products: Product[]): Product[] {
    const page = this.currentPage(category);
    const start = (page - 1) * this.pageSize;
    return products.slice(start, start + this.pageSize);
  }

  protected pages(products: Product[]): number[] {
    return Array.from({ length: this.totalPages(products) }, (_item, index) => index + 1);
  }

  protected setCategoryPage(category: string, page: number, products: Product[]): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages(products));
    this.categoryPages.update((pages) => ({ ...pages, [category]: nextPage }));
    requestAnimationFrame(() => {
      document.getElementById(this.categoryDomId(category))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  protected categoryDomId(category: string): string {
    return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }
}
