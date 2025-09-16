import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Offer, PaginatedResponse, PaginationParams } from '../models/offredata.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = '/api/flowscope_core/offer';

  constructor(private http: HttpClient) {}

  createOffer(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }

  // Legacy method for backward compatibility
  getOffers(): Observable<Offer[]> {
    return this.getOffersPaginated({ page_number: 1, page_size: 100 }).pipe(
      map(response => response.items || response.offers || response.data || response.results || [])
    );
  }

  // New paginated method
  getOffersPaginated(params: PaginationParams): Observable<PaginatedResponse<Offer>> {
    let httpParams = new HttpParams()
      .set('page_number', params.page_number.toString())
      .set('page_size', params.page_size.toString());

    return this.http.get<PaginatedResponse<Offer>>(this.apiUrl, { 
      params: httpParams,
      withCredentials: true 
    });
  }

  
}
