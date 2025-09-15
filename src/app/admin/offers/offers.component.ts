import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';

interface OfferRow {
  id?: number | string;
  title?: string;
  user_email?: string;
  description?: string;
  imageUrl?: string;
  client_id?: number | string;
  category_id?: number | string;
  category_name?: string;
  url?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, Menu],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class AdminOffersComponent implements OnInit {
  loading = signal<boolean>(false);
  deleting = signal<boolean>(false);
  errorMessage = signal<string>('');
  offers = signal<OfferRow[]>([]);
  search = signal<string>('');
  clientsEmailById = signal<Record<string, string>>({});
  categoryNameById = signal<Record<string, string>>({});

  // Details modal
  showModal = signal<boolean>(false);
  selectedOffer = signal<OfferRow | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchClients();
    this.fetchCategories();
    this.fetchOffers();
  }

  private fetchClients(): void {
    this.http.get<any>('/api/flowscope_core/client', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.clients || res?.items || res?.data || res?.results || []);
          const dict: Record<string, string> = {};
          (Array.isArray(raw) ? raw : []).forEach((c: any) => {
            const id = c.client_id ?? c.id;
            if (id != null) dict[String(id)] = c.email ?? '';
          });
          this.clientsEmailById.set(dict);
          // enrich offers if already loaded
          if (this.offers().length) {
            const enriched = this.offers().map(o => ({
              ...o,
              user_email: o.user_email || dict[String(o.client_id ?? '')] || ''
            }));
            this.offers.set(enriched);
          }
        },
        error: () => {}
      });
  }

  private fetchCategories(): void {
    this.http.get<any>('/api/flowscope_core/category', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.categories || res?.items || res?.data || res?.results || []);
          const dict: Record<string, string> = {};
          (Array.isArray(raw) ? raw : []).forEach((c: any) => {
            const id = c.category_id ?? c.id;
            if (id != null) dict[String(id)] = c.name ?? '';
          });
          this.categoryNameById.set(dict);
          if (this.offers().length) {
            const enriched = this.offers().map(o => ({
              ...o,
              category_name: o.category_name || dict[String(o.category_id ?? '')] || o.category_name || ''
            }));
            this.offers.set(enriched);
          }
        },
        error: () => {}
      });
  }

  fetchOffers(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.get<any>('/api/flowscope_core/offer', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.offers || res?.items || res?.data || res?.results || []);
          const mapped: OfferRow[] = (Array.isArray(raw) ? raw : []).map((o: any) => ({
            id: o.offer_id ?? o.id,
            title: o.name ?? o.title ?? '',
            user_email: o.client?.email ?? o.user?.email ?? o.email ?? '',
            description: o.description ?? '',
            client_id: o.client_id ?? o.client?.id,
            category_id: o.category_id ?? o.category?.id,
            category_name: o.category?.name,
            url: o.url ?? '',
            imageUrl: (() => {
              const base64 = o.file;
              if (!base64) return '';
              const ext = String(o.file_extension || '').toLowerCase();
              let mime = 'image/png';
              if (ext === '.svg') mime = 'image/svg+xml';
              else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
              else if (ext === '.png') mime = 'image/png';
              return `data:${mime};base64,${base64}`;
            })()
          }));
          // enrich with client email map if available
          const clientDict = this.clientsEmailById();
          const categoryDict = this.categoryNameById();
          const enriched = mapped.map(m => ({
            ...m,
            user_email: m.user_email || clientDict[String(m.client_id ?? '')] || '',
            category_name: m.category_name || categoryDict[String(m.category_id ?? '')] || m.category_name || ''
          }));
          this.offers.set(enriched);
          this.loading.set(false);
        },
        error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to load offers'); this.loading.set(false); }
      });
  }

  filtered() {
    const q = this.search().trim().toLowerCase();
    return this.offers().filter(o => !q || o.title?.toLowerCase().includes(q) || o.user_email?.toLowerCase().includes(q));
  }

  delete(row: OfferRow): void {
    if (!row?.id || this.deleting()) return;
    this.deleting.set(true);
    this.http.post('/api/flowscope_core/offer/delete', { offer_id: row.id }, { withCredentials: true })
      .subscribe({ next: () => { this.deleting.set(false); this.fetchOffers(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to delete offer'); this.deleting.set(false); } });
  }
}


