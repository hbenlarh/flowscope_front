import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';
import { Footer } from '../../shared/footer/footer';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';

interface ContainerRow {
  id?: number | string;
  name: string;
  description?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-containers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Menu,Footer,DashboardHeader],
  templateUrl: './containers.component.html',
  styleUrl: './containers.component.scss'
})
export class AdminContainersComponent implements OnInit {
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string>('');
  containers = signal<ContainerRow[]>([]);

  // Filters
  search = signal<string>('');

  // Modal state
  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  form!: FormGroup;
  editingId: number | string | null = null;

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.containers().filter(c => !q || c.name?.toLowerCase().includes(q));
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
    this.fetchContainers();
  }

  fetchContainers(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.get<any>('/api/flowscope_core/container', { withCredentials: true })
      .subscribe({
        next: (res) => {
          const raw = Array.isArray(res) ? res : (res?.containers || res?.items || res?.data || res?.results || []);
          const normalized: ContainerRow[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id: c.container_id ?? c.id ?? c.uuid,
            name: c.name ?? c.container_name ?? '',
            description: c.description ?? '',
            is_active: c.is_active
          }));
          this.containers.set(normalized);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load containers');
          this.loading.set(false);
        }
      });
  }

  openAdd(): void {
    this.isEdit.set(false);
    this.editingId = null;
    this.form.reset({ name: '', description: '' });
    this.showModal.set(true);
  }

  openEdit(row: ContainerRow): void {
    this.isEdit.set(true);
    this.editingId = row.id ?? null;
    this.form.reset({ name: row.name || '', description: row.description || '' });
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
      // Update existing
      this.http.patch('/api/flowscope_core/container', { container_id: this.editingId, ...payload }, { withCredentials: true })
        .subscribe({
          next: () => { this.saving.set(false); this.showModal.set(false); this.fetchContainers(); },
          error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to update'); this.saving.set(false); }
        });
    } else {
      // Create new
      this.http.post('/api/flowscope_core/container', payload, { withCredentials: true })
        .subscribe({
          next: () => { this.saving.set(false); this.showModal.set(false); this.fetchContainers(); },
          error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to create'); this.saving.set(false); }
        });
    }
  }

  delete(row: ContainerRow): void {
    if (!row?.id || this.saving()) return;
    this.saving.set(true);
    this.http.post('/api/flowscope_core/container/delete', { container_id: row.id }, { withCredentials: true })
      .subscribe({
        next: () => { this.saving.set(false); this.fetchContainers(); },
        error: (err) => { this.errorMessage.set(err?.error?.message || 'Failed to delete'); this.saving.set(false); }
      });
  }
}


