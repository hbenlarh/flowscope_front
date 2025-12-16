import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserMenu } from '../user-menu/user-menu';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { PaginatedResponse, PaginationParams } from '../../services/models/offredata.model';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { OfferService } from '../../services/offer/offer';

interface OfferRow {
  id?: number | string;
  title?: string;
  description?: string;
  imageUrl?: string;
  client_id?: number | string;
  category_id?: number | string;
  category_name?: string;
  url?: string;
  file_name?: string;
  file_base64?: string;
  file_id?: number | string;
}

interface CategoryOption { id: number | string; name: string; container_id?: number | string; }
interface ContainerOption { id: number | string; name: string; }

@Component({
  selector: 'app-user-my-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UserMenu, AdminFooter, DashboardHeader],
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
  categoriesList = signal<CategoryOption[]>([]);
  containersList = signal<ContainerOption[]>([]);
  showModal = signal<boolean>(false);
  form!: FormGroup;
  editingId: number | string | null = null;

  // Pagination properties
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  paginationInfo = signal<PaginatedResponse<OfferRow> | null>(null);

  // Make Math available in template
  Math = Math;

  constructor(private http: HttpClient, private fb: FormBuilder, private offerService: OfferService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category_id: [null, [Validators.required]],
      url: ['']
    });
    this.fetchMe();
    this.fetchCategories();
    this.fetchContainers();
    this.fetchOffers();
  }

  private fetchMe(): void {
    this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/client/me', { withCredentials: true }).subscribe({
      next: (me) => { this.meClientId = me?.client_id ?? me?.id ?? null; },
      error: () => { this.meClientId = null; }
    });
  }

  private fetchCategories(): void {
    this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category', { withCredentials: true }).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res?.categories || res?.items || res?.data || res?.results || []);
        const dict: Record<string, string> = {};
        const list: CategoryOption[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
          id: c.category_id ?? c.id,
          name: c.name ?? '',
          container_id: c.container_id ?? c.container?.container_id
        }));
        list.forEach((c: CategoryOption) => {
          const id = c.id;
          if (id != null) dict[String(id)] = c.name ?? '';
        });
        this.categoryNameById.set(dict);
        this.categoriesList.set(list);
        if (this.offers().length) this.offers.set(this.enrichAndFilter(this.offers()));
      },
      error: () => { }
    });
  }

  private fetchContainers(): void {
    this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/container', { withCredentials: true }).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res?.containers || res?.items || res?.data || res?.results || []);
        const mapped: ContainerOption[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
          id: c.container_id ?? c.id,
          name: c.name ?? ''
        }));
        this.containersList.set(mapped);
      },
      error: () => { }
    });
  }

  fetchOffers(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const paginationParams: PaginationParams = {
      page_number: this.currentPage(),
      page_size: this.pageSize()
    };

    let httpParams = new HttpParams()
      .set('page_number', paginationParams.page_number.toString())
      .set('page_size', paginationParams.page_size.toString());

    this.http.get<PaginatedResponse<any>>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer', {
      params: httpParams,
      withCredentials: true
    }).subscribe({
      next: (res) => {
        this.paginationInfo.set(res);
        const raw = res.items || res.offers || res.data || res.results || [];
        const mapped: OfferRow[] = (Array.isArray(raw) ? raw : []).map((o: any) => ({
          id: o.offer_id ?? o.id,
          title: o.name ?? o.title ?? '',
          description: o.description ?? '',
          client_id: o.client_id ?? o.client?.id,
          category_id: o.category_id ?? o.category?.id,
          category_name: o.category?.name,
          url: o.url ?? '',
          file_name: o.file_name ?? '',
          file_base64: o.file ?? '',
          file_id: o.file_id ?? 0,
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
        this.totalItems.set(res.total_items || res.total || raw.length);
        this.totalPages.set(res.total_pages || Math.ceil(this.totalItems() / this.pageSize()));
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

  openEdit(row: OfferRow): void {
    this.editingId = row.id ?? null;
    this.form.reset({
      title: row.title || '',
      description: row.description || '',
      category_id: row.category_id ?? null,
      url: row.url || ''
    });
    this.showModal.set(true);
  }

  save(): void {
    this.errorMessage.set('');
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingId) return;
    this.loading.set(true);
    const original = this.offers().find(o => o.id === this.editingId);
    const payload = {
      offer_id: this.editingId,
      name: this.form.value.title,
      description: this.form.value.description,
      category_id: this.form.value.category_id,
      url: this.form.value.url,
      file_name: original?.file_name || '',
      file_base64: original?.file_base64 || '',
      file_id: original?.file_id || 0
    };
    this.offerService.updateOffer(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.showModal.set(false);
        this.fetchOffers();
      },
      error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to update offer'); this.loading.set(false); }
    });
  }

  delete(row: OfferRow): void {
    if (!row?.id || this.loading()) return;
    const ok = window.confirm('Delete this offer?');
    if (!ok) return;
    this.loading.set(true);
    this.offerService.deleteOffer(row.id).subscribe({
      next: () => { this.loading.set(false); this.fetchOffers(); },
      error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to delete offer'); this.loading.set(false); }
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.fetchOffers();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}


