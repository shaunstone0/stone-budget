import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ApiResponse,
  Bank,
  Bill,
  BillQuery,
  BillStatus,
  Category,
  CreateBankDTO,
  CreateBillDTO,
  CreateMonthlyBalanceDTO,
  MonthlyBalance,
  PaginatedResponse,
} from '../../types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api/v1';

  constructor(private readonly http: HttpClient) {}

  // Bills API
  getBills(query?: BillQuery): Observable<PaginatedResponse<Bill>> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Bill>>(`${this.API_URL}/bills`, { params });
  }

  getBill(id: string): Observable<ApiResponse<Bill>> {
    return this.http.get<ApiResponse<Bill>>(`${this.API_URL}/bills/${id}`);
  }

  createBill(bill: CreateBillDTO): Observable<ApiResponse<Bill>> {
    return this.http.post<ApiResponse<Bill>>(`${this.API_URL}/bills`, bill);
  }

  updateBill(id: string, bill: Partial<CreateBillDTO>): Observable<ApiResponse<Bill>> {
    return this.http.put<ApiResponse<Bill>>(`${this.API_URL}/bills/${id}`, bill);
  }

  deleteBill(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/bills/${id}`);
  }

  updateBillStatus(id: string, status: BillStatus): Observable<ApiResponse<Bill>> {
    return this.http.patch<ApiResponse<Bill>>(`${this.API_URL}/bills/${id}/status`, { status });
  }

  // Categories API
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.API_URL}/categories`);
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.API_URL}/categories/${id}`);
  }

  // Banks API
  getBanks(): Observable<ApiResponse<Bank[]>> {
    return this.http.get<ApiResponse<Bank[]>>(`${this.API_URL}/banks`);
  }

  getBank(id: string): Observable<ApiResponse<Bank>> {
    return this.http.get<ApiResponse<Bank>>(`${this.API_URL}/banks/${id}`);
  }

  createBank(bank: CreateBankDTO): Observable<ApiResponse<Bank>> {
    return this.http.post<ApiResponse<Bank>>(`${this.API_URL}/banks`, bank);
  }

  updateBank(id: string, bank: Partial<CreateBankDTO>): Observable<ApiResponse<Bank>> {
    return this.http.put<ApiResponse<Bank>>(`${this.API_URL}/banks/${id}`, bank);
  }

  deleteBank(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/banks/${id}`);
  }

  // Monthly Balances API
  getMonthlyBalances(query?: {
    month?: string;
    bankId?: string;
  }): Observable<ApiResponse<MonthlyBalance[]>> {
    let params = new HttpParams();

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<MonthlyBalance[]>>(`${this.API_URL}/balances`, { params });
  }

  getMonthlyBalance(id: string): Observable<ApiResponse<MonthlyBalance>> {
    return this.http.get<ApiResponse<MonthlyBalance>>(`${this.API_URL}/balances/${id}`);
  }

  createMonthlyBalance(balance: CreateMonthlyBalanceDTO): Observable<ApiResponse<MonthlyBalance>> {
    return this.http.post<ApiResponse<MonthlyBalance>>(`${this.API_URL}/balances`, balance);
  }

  updateMonthlyBalance(
    id: string,
    balance: Partial<CreateMonthlyBalanceDTO>
  ): Observable<ApiResponse<MonthlyBalance>> {
    return this.http.put<ApiResponse<MonthlyBalance>>(`${this.API_URL}/balances/${id}`, balance);
  }

  deleteMonthlyBalance(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/balances/${id}`);
  }

  // Utility methods
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getFirstDayOfMonth(date: Date): string {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return this.formatDateForApi(firstDay);
  }

  getCurrentMonth(): string {
    return this.getFirstDayOfMonth(new Date());
  }
}
