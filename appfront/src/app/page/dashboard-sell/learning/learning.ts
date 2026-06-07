import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play, ChevronRight, Plus } from 'lucide-angular';

@Component({
  selector: 'app-learning',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './learning.html'
})
export class Learning {
  courses = [
    {
      progress: 66,
      title: 'Alspicalures',
      subtitle: 'Aying learning beak seeding.',
      color: '#4BB584'
    },
    {
      progress: 74,
      title: 'Advisting elearning',
      subtitle: 'Helder coin thas tius as fancits an.',
      color: '#4BB584'
    },
    {
      progress: 75,
      title: 'Accesation',
      subtitle: 'Mering loarnentt of hoartis cotat.',
      color: '#4BB584'
    },
    {
      progress: 50,
      title: 'Elenofries',
      subtitle: 'Gering loarnentt of hoartis.',
      color: '#4BB584'
    }
  ];
}
