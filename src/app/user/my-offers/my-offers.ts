import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserMenu } from '../user-menu/user-menu';
import { Footer } from '../../shared/footer/footer';

interface OfferRow {
  id?: number | string;
  title?: string;
  description?: string;
  imageUrl?: string;
  client_id?: number | string;
  category_id?: number | string;
  category_name?: string;
  url?: string;
}

@Component({
  selector: 'app-user-my-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, UserMenu, Footer],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.scss'
})
export class UserMyOffers implements OnInit {
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  offers = signal<OfferRow[]>([]);
  search = signal<string>('');
  meClientId: number | string | null = null;
  categoryNameById = signal<Record<string, string>>({});

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMe();
    this.fetchCategories();
    this.fetchOffers();
  }

  private fetchMe(): void {
    this.http.get<any>('/api/flowscope_core/client/me', { withCredentials: true }).subscribe({
      next: (me) => { this.meClientId = me?.client_id ?? me?.id ?? null; },
      error: () => { this.meClientId = null; }
    });
  }

  private fetchCategories(): void {
    this.http.get<any>('/api/flowscope_core/category', { withCredentials: true }).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res?.categories || res?.items || res?.data || res?.results || []);
        const dict: Record<string, string> = {};
        (Array.isArray(raw) ? raw : []).forEach((c: any) => {
          const id = c.category_id ?? c.id;
          if (id != null) dict[String(id)] = c.name ?? '';
        });
        this.categoryNameById.set(dict);
        if (this.offers().length) this.offers.set(this.enrichAndFilter(this.offers()));
      },
      error: () => {}
    });
  }

  private fetchOffers(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.get<any>('/api/flowscope_core/offer', { withCredentials: true }).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res?.offers || res?.items || res?.data || res?.results || []);
        const mapped: OfferRow[] = (Array.isArray(raw) ? raw : []).map((o: any) => ({
          id: o.offer_id ?? o.id,
          title: o.name ?? o.title ?? '',
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
        this.offers.set(this.enrichAndFilter(mapped));
        this.loading.set(false);
      },
      error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to load offers'); this.loading.set(false); }
    });
  }

  private enrichAndFilter(list: OfferRow[]): OfferRow[] {
    const dict = this.categoryNameById();
    const meId = this.meClientId;
    return list
      .filter(o => (meId == null) ? true : String(o.client_id ?? '') === String(meId))
      .map(o => ({ ...o, category_name: o.category_name || dict[String(o.category_id ?? '')] || o.category_name || '' }));
  }

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.offers().filter(o => !q || o.title?.toLowerCase().includes(q) || o.url?.toLowerCase().includes(q));
  });
}


