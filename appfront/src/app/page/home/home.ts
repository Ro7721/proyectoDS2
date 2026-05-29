import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  isMenuOpen = false;

  popularCourses = [
    { id: 1, img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', title: 'Business Strategy' },
    { id: 2, img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', title: 'Web Development' },
    { id: 3, img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', title: 'Remote Work' },
    { id: 4, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400', title: 'Productivity' },
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
