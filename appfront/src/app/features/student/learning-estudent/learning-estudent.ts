import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-learning-estudent',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './learning-estudent.html',
  styleUrl: './learning-estudent.css',
})
export class LearningEstudent {
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
