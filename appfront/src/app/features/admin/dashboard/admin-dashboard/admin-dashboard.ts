import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../api/api';
import { getDashboardStats } from '../../../../api/functions';
import { DashboardResponse } from '../../../../api/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardResponse | null = null;
  loading = true;
  error = '';

  constructor(readonly api: Api, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.loadStats());
  }

  loadStats() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.invoke(getDashboardStats).then((response: any) => {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (parsed.data) {
        this.stats = parsed.data;
      }
    }).catch(err => {
      this.error = 'Error cargando las estadísticas';
      console.error(err);
    }).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}
