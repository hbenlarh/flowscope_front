import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';
import { Footer } from '../../shared/footer/footer';

interface ClientRow {
  id?: string | number;
  full_name?: string;
  email?: string;
  is_admin?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule,Menu,Footer],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  clients = signal<ClientRow[]>([]);

  // Filters
  search = signal<string>('');
  roleFilter = signal<'all' | 'admin' | 'client'>('all');

  filteredClients = computed(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.clients().filter((c) => {
      const matchesQuery = !q ||
        (c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
      const matchesRole = role === 'all' ||
        (role === 'admin' && !!c.is_admin) ||
        (role === 'client' && !c.is_admin);
      return matchesQuery && matchesRole;
    });
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.get<any>('/api/flowscope_core/client', { withCredentials: true })
      .subscribe({
        next: (rows) => {
          // Normalize and map API response
          const raw = Array.isArray(rows)
            ? rows
            : rows?.clients || rows?.items || rows?.data || rows?.results || [];
          const normalized: ClientRow[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
            id: c.client_id,
            full_name: [c.first_name, c.last_name].filter(Boolean).join(' ').trim(),
            email: c.email,
            is_admin: !!c.is_admin,
            is_active: c.is_active
          }));
          console.log('AdminUsersComponent: normalized clients', normalized);
          this.clients.set(normalized);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load clients');
          this.loading.set(false);
        }
      });
  }
}


