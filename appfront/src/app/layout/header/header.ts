import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, InputTextModule, IconFieldModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  sidebarVisible = signal<boolean>(false);
  @Input() title = 'Dashboard';
  @Input() userName = 'Usuario';
  @Input() role: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT';

  toggleSidebar() {
    this.sidebarVisible.update((value) => !value);
    console.log(this.sidebarVisible());
  }
}
