import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';
import { Footer } from '../../shared/footer/footer';

interface CategoryRow {
  id?: number | string;
  name: string;
  description?: string;
  container_id?: number | string;
  container_name?: string;
}

interface ContainerOption { id: number | string; name: string; }

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Menu,Footer],
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
    this.http.get<any>('/api/flowscope_core/container', { withCredentials: true })
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
    this.http.get<any>('/api/flowscope_core/category', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.categories || res?.items || res?.data || res?.results || []);
          const mapped: CategoryRow[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id: c.category_id ?? c.id,
            name: c.name ?? '',
            description: c.description ?? '',
            container_id: c.container_id ?? c.container?.container_id,
            container_name: c.container?.name
          }));
          this.categories.set(mapped);
          this.loading.set(false);
        },
        error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to load categories'); this.loading.set(false); }
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
      this.http.patch('/api/flowscope_core/category', { category_id: this.editingId, ...payload }, { withCredentials: true })
        .subscribe({ next: () => { this.saving.set(false); this.showModal.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to update'); this.saving.set(false); } });
    } else {
      this.http.post('/api/flowscope_core/category', payload, { withCredentials: true })
        .subscribe({ next: () => { this.saving.set(false); this.showModal.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to create'); this.saving.set(false); } });
    }
  }

  delete(row: CategoryRow): void {
    if (!row?.id || this.saving()) return;
    this.saving.set(true);
    this.http.post('/api/flowscope_core/category/delete', { category_id: row.id }, { withCredentials: true })
      .subscribe({ next: () => { this.saving.set(false); this.fetchCategories(); }, error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to delete'); this.saving.set(false); } });
  }
}


