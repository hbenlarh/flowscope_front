import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../menu/menu';
import { Footer } from '../../shared/footer/footer';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';

interface ClientRow {
  id?: string | number;
  full_name?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule,Menu,Footer,DashboardHeader],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  clients = signal<ClientRow[]>([]);
  deactivatingClient = signal<number | null>(null);

  // Filters
  search = signal<string>('');
  roleFilter = signal<'all' | 'admin' | 'client'>('all');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  filteredClients = computed(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();
    return this.clients().filter((c) => {
      const matchesQuery = !q ||
        (c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
      const matchesRole = role === 'all' ||
        (role === 'admin' && !!c.is_admin) ||
        (role === 'client' && !c.is_admin);
      const matchesStatus = status === 'all' ||
        (status === 'active' && !!c.is_active) ||
        (status === 'inactive' && !c.is_active);
      return matchesQuery && matchesRole && matchesStatus;
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
            id: c.client_id || c.id,
            full_name: [c.first_name, c.last_name].filter(Boolean).join(' ').trim(),
            email: c.email,
            is_admin: !!c.is_admin,
            is_active: c.is_active !== false // Default to true if not specified
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

  deactivateClient(client: ClientRow): void {
    if (!client.id) {
      this.errorMessage.set('Invalid client ID');
      return;
    }

    if (client.is_admin) {
      this.errorMessage.set('Cannot deactivate admin users');
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${client.full_name || client.email}? This action cannot be undone.`)) {
      return;
    }

    this.deactivatingClient.set(Number(client.id));
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post(`/api/flowscope_core/client/deactivate`, 
      { client_id: client.id }, 
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.successMessage.set(`Client ${client.full_name || client.email} has been deactivated successfully`);
        this.deactivatingClient.set(null);
        // Update the client status in the local state
        this.clients.update(clients => 
          clients.map(c => 
            c.id === client.id ? { ...c, is_active: false } : c
          )
        );
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to deactivate client');
        this.deactivatingClient.set(null);
      }
    });
  }

  reactivateClient(client: ClientRow): void {
    if (!client.id) {
      this.errorMessage.set('Invalid client ID');
      return;
    }

    if (!confirm(`Are you sure you want to reactivate ${client.full_name || client.email}?`)) {
      return;
    }

    this.deactivatingClient.set(Number(client.id));
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post(`/api/flowscope_core/client/reactivate`, 
      { client_id: client.id }, 
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.successMessage.set(`Client ${client.full_name || client.email} has been reactivated successfully`);
        this.deactivatingClient.set(null);
        // Update the client status in the local state
        this.clients.update(clients => 
          clients.map(c => 
            c.id === client.id ? { ...c, is_active: true } : c
          )
        );
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to reactivate client');
        this.deactivatingClient.set(null);
      }
    });
  }
}


