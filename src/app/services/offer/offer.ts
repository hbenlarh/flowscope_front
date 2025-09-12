import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = '/api/flowscope_core/offer';

  constructor(private http: HttpClient) {}

  createOffer(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { withCredentials: true });
  }
}
