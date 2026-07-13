import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Category, Discount, DiscountPayload, Product, ProductPayload } from './catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  publicProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/public/products`);
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/admin/categories`, {
      headers: this.authService.authHeaders(),
    });
  }

  createCategory(payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/admin/categories`, payload, {
      headers: this.authService.authHeaders(),
    });
  }

  updateCategory(id: number, payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/admin/categories/${id}`, payload, {
      headers: this.authService.authHeaders(),
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/categories/${id}`, {
      headers: this.authService.authHeaders(),
    });
  }

  products(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/admin/products`, {
      headers: this.authService.authHeaders(),
    });
  }

  createProduct(payload: ProductPayload, image: File | null): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, this.productFormData(payload, image), {
      headers: this.authService.authHeaders(),
    });
  }

  updateProduct(id: number, payload: ProductPayload, image: File | null): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/admin/products/${id}`, this.productFormData(payload, image), {
      headers: this.authService.authHeaders(),
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/products/${id}`, {
      headers: this.authService.authHeaders(),
    });
  }

  discounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.apiUrl}/admin/discounts`, {
      headers: this.authService.authHeaders(),
    });
  }

  createDiscount(payload: DiscountPayload): Observable<Discount> {
    return this.http.post<Discount>(`${this.apiUrl}/admin/discounts`, payload, {
      headers: this.authService.authHeaders(),
    });
  }

  updateDiscount(id: number, payload: DiscountPayload): Observable<Discount> {
    return this.http.patch<Discount>(`${this.apiUrl}/admin/discounts/${id}`, payload, {
      headers: this.authService.authHeaders(),
    });
  }

  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/discounts/${id}`, {
      headers: this.authService.authHeaders(),
    });
  }

  private productFormData(payload: ProductPayload, image: File | null): FormData {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (image) {
      formData.append('image', image);
    }

    return formData;
  }
}
