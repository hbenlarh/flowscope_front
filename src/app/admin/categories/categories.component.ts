import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { forkJoin } from 'rxjs';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';

interface CategoryRow {
  id?: number | string;
  name: string;
  description?: string;
  container_id?: number | string;
  container_name?: string;
  offers_count?: number;
}

interface ContainerOption { id: number | string; name: string; }

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Menu,AdminFooter,DashboardHeader],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string>('');
  categories = signal<CategoryRow[]>([]);
  containers = signal<ContainerOption[]>([]);

  // Filters
  search = signal<string>('');

  // Modal state
  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  form!: FormGroup;
  editingId: number | string | null = null;

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.categories().filter(c => !q || c.name?.toLowerCase().includes(q));
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      container_id: [null, [Validators.required]]
    });
    this.fetchContainersOptions();
    this.fetchCategories();
  }

  getContainerName(row: CategoryRow): string {
    if (row.container_name) return row.container_name;
    const list = this.containers();
    const found = Array.isArray(list) ? list.find(opt => String(opt.id) === String(row.container_id)) : undefined;
    return found?.name || '-';
  }

  fetchContainersOptions(): void {
    this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/container', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.containers || res?.items || res?.data || res?.results || []);
          const mapped: ContainerOption[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id: c.container_id ?? c.id,
            name: c.name ?? c.container_name ?? ''
          }));
          this.containers.set(mapped);
        },
        error: () => {}
      });
  }

  fetchCategories(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    
    // First fetch categories
    this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category', { withCredentials: true })
      .subscribe({
        next: (categories) => {
          console.log('Categories API Response:', categories); // Debug log
          const categoriesRaw = Array.isArray(categories) ? categories : (categories?.categories || categories?.items || categories?.data || categories?.results || []);
          
          // Then fetch offers to count them per category
          this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer?page_number=1&page_size=1000', { withCredentials: true })
            .subscribe({
              next: (offers) => {
                const offersRaw = Array.isArray(offers) ? offers : (offers?.items || offers?.offers || offers?.data || offers?.results || []);
                
                // Count offers per category
                const offerCountMap: { [categoryId: number]: number } = {};
                offersRaw.forEach((offer: any) => {
                  if (offer.category_id) {
                    offerCountMap[offer.category_id] = (offerCountMap[offer.category_id] || 0) + 1;
                  }
                });
                
                const mapped: CategoryRow[] = (Array.isArray(categoriesRaw) ? categoriesRaw : []).map((c: any) => ({
                  id: c.category_id ?? c.id,
                  name: c.name ?? '',
                  description: c.description ?? '',
                  container_id: c.container_id ?? c.container?.container_id,
                  container_name: c.container?.name,
                  offers_count: offerCountMap[c.category_id ?? c.id] || 0
                }));
                this.categories.set(mapped);
                this.loading.set(false);
              },
              error: (err) => {
                console.error('Error loading offers for category count:', err);
                // Still show categories even if offers count fails
                const mapped: CategoryRow[] = (Array.isArray(categoriesRaw) ? categoriesRaw : []).map((c: any) => ({
                  id: c.category_id ?? c.id,
                  name: c.name ?? '',
                  description: c.description ?? '',
                  container_id: c.container_id ?? c.container?.container_id,
                  container_name: c.container?.name,
                  offers_count: 0
                }));
                this.categories.set(mapped);
                this.loading.set(false);
              }
            });
        },
        error: (err) => { 
          console.error('Error loading categories:', err);
          this.errorMessage.set(err?.error?.message || 'Failed to load categories'); 
          this.loading.set(false); 
        }
      });
  }

  openAdd(): void {
    this.isEdit.set(false);
    this.editingId = null;
    this.form.reset({ name: '', description: '', container_id: null });
    this.showModal.set(true);
  }

  openEdit(row: CategoryRow): void {
    this.isEdit.set(true);
    this.editingId = row.id ?? null;
    this.form.reset({ name: row.name || '', description: row.description || '', container_id: row.container_id ?? null });
    this.showModal.set(true);
  }

  save(): void {
    this.errorMessage.set('');
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.value;
    if (this.isEdit()) {
      this.http.patch('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category', { category_id: this.editingId, ...payload }, { withCredentials: true })
        .subscribe({ next: () => { this.saving.set(false); this.showModal.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to update'); this.saving.set(false); } });
    } else {
      this.http.post('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category', payload, { withCredentials: true })
        .subscribe({ next: () => { this.saving.set(false); this.showModal.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to create'); this.saving.set(false); } });
    }
  }

  delete(row: CategoryRow): void {
    if (!row?.id || this.saving()) return;
    this.saving.set(true);
    this.http.post('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category/delete', { category_id: row.id }, { withCredentials: true })
      .subscribe({ next: () => { this.saving.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to delete'); this.saving.set(false); } });
  }
}


