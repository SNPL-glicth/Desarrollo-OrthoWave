import axios from 'axios';
import { API_CONFIG } from '../config/api.js';

const API_URL = API_CONFIG.BASE_URL;

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  brand: string;
  is_available: boolean;
  requires_prescription: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductReservation {
  id: number;
  patient_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  doctor_notes?: string;
  confirmed_by_doctor_id?: number;
  confirmed_at?: string;
  delivered_at?: string;
  product: Product;
  patient?: any;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ReservationSummary {
  pending: ProductReservation[];
  confirmed: ProductReservation[];
  delivered: ProductReservation[];
  cancelled: ProductReservation[];
  totalPending: number;
  totalConfirmed: number;
}

class ProductsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // PRODUCTOS
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // CARRITO DE COMPRAS (local storage)
  getCart(): CartItem[] {
    try {
      const cart = localStorage.getItem('ortowhave_cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  addToCart(product: Product, quantity: number = 1): boolean {
    try {
      let cart = this.getCart();
      const existingItem = cart.find(item => item.product.id === product.id);
      
      // Calcular total de productos que habría después de agregar
      const currentTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
      const newTotal = currentTotal + quantity;
      
      // Verificar límite de 10 productos
      if (newTotal > 10) {
        return false; // No se pudo agregar por límite
      }

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ product, quantity });
      }

      localStorage.setItem('ortowhave_cart', JSON.stringify(cart));
      return true; // Se agregó exitosamente
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  removeFromCart(productId: number): void {
    try {
      let cart = this.getCart();
      cart = cart.filter(item => item.product.id !== productId);
      localStorage.setItem('ortowhave_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  updateCartQuantity(productId: number, quantity: number): void {
    try {
      let cart = this.getCart();
      const item = cart.find(item => item.product.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
          localStorage.setItem('ortowhave_cart', JSON.stringify(cart));
        }
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  }

  clearCart(): void {
    try {
      localStorage.removeItem('ortowhave_cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  // RESERVAS DE PRODUCTOS
  async reserveProducts(notes?: string): Promise<ProductReservation[]> {
    try {
      const cart = this.getCart();
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      const productIds = cart.map(item => item.product.id);
      const quantities = cart.reduce((acc, item) => {
        acc[item.product.id] = item.quantity;
        return acc;
      }, {} as { [key: number]: number });

      const response = await axios.post(`${API_URL}/products/reserve`, {
        product_ids: productIds,
        quantities,
        notes
      }, this.getAuthHeaders());

      // Limpiar carrito después de reservar
      this.clearCart();

      return response.data;
    } catch (error) {
      console.error('Error reserving products:', error);
      throw error;
    }
  }

  async getMyReservations(): Promise<ProductReservation[]> {
    try {
      const response = await axios.get(`${API_URL}/products/reservations/my`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching my reservations:', error);
      throw error;
    }
  }

  async getMyReservationSummary(): Promise<ReservationSummary> {
    try {
      const response = await axios.get(`${API_URL}/products/reservations/summary/my`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching my reservation summary:', error);
      throw error;
    }
  }

  // PARA DOCTORES
  async getPatientReservations(patientId: number): Promise<ProductReservation[]> {
    try {
      const response = await axios.get(`${API_URL}/products/reservations/patient/${patientId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching patient reservations:', error);
      throw error;
    }
  }

  async getPatientReservationSummary(patientId: number): Promise<ReservationSummary> {
    try {
      const response = await axios.get(`${API_URL}/products/reservations/patient/${patientId}/summary`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching patient reservation summary:', error);
      throw error;
    }
  }

  async updateReservationStatus(reservationId: number, status: string, doctorNotes?: string): Promise<ProductReservation> {
    try {
      const response = await axios.patch(`${API_URL}/products/reservations/${reservationId}/status`, {
        status,
        doctor_notes: doctorNotes
      }, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  }

  async getPendingReservations(): Promise<ProductReservation[]> {
    try {
      const response = await axios.get(`${API_URL}/products/reservations/pending`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reservations:', error);
      throw error;
    }
  }
}

export const productsService = new ProductsService();
