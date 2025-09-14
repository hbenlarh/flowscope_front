import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Offer } from '../models/offredata.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = '/api/flowscope_core/offer';

  constructor(private http: HttpClient) {}

  createOffer(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }
  getOffers(): Observable<Offer[]> {
    return this.http.get<{ offers: Offer[] }>(this.apiUrl, { withCredentials: true })
      .pipe(
        map(res => res.offers)
      );
  }

  
}
