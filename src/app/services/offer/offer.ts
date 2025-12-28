import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Offer, PaginatedResponse, PaginationParams } from '../models/offredata.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer';

  constructor(private http: HttpClient) { }

  createOffer(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }

  // Legacy method for backward compatibility
  getOffers(): Observable<Offer[]> {
    return this.getOffersPaginated({ page_number: 1, page_size: 100 }).pipe(
      map(response => response.items || response.offers || response.data || response.results || [])
    );
  }

  // New paginated method with optional search and category filtering
  getOffersPaginated(params: PaginationParams): Observable<PaginatedResponse<Offer>> {
    let httpParams = new HttpParams()
      .set('page_number', params.page_number.toString())
      .set('page_size', params.page_size.toString());

    // Add optional search parameter
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    // Add optional category filter
    if (params.category_id !== undefined && params.category_id !== null) {
      httpParams = httpParams.set('category_id', params.category_id.toString());
    }

    // Add timestamp to prevent caching
    httpParams = httpParams.set('_t', new Date().getTime().toString());

    return this.http.get<PaginatedResponse<Offer>>(this.apiUrl, {
      params: httpParams,
      withCredentials: true
    });
  }

  updateOffer(data: any): Observable<any> {
    return this.http.patch(this.apiUrl, data, { withCredentials: true });
  }

  deleteOffer(offerId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete`, { offer_id: offerId }, { withCredentials: true });
  }

  getOfferBySlug(slug: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${slug}`, { withCredentials: true });
  }


}
