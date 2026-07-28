import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.html',
})
export class Pricing {
  billingAnnual = false;

  plans = [
    {
      name: 'Gratis',
      description: 'Empieza tu camino de aprendizaje sin costo.',
      monthlyPrice: 0,
      annualPrice: 0,
      color: 'gray',
      badge: null,
      cta: 'Comenzar gratis',
      ctaRoute: '/auth/register',
      featured: false,
      features: [
        'Acceso a cursos gratuitos',
        'Seguimiento de progreso básico',
        'Certificados de finalización',
        '1 GB de almacenamiento',
        'Soporte por correo',
      ],
      missing: [
        'Acceso ilimitado a cursos premium',
        'Descargas sin conexión',
        'Soporte prioritario 24/7',
        'Mentores personales',
      ]
    },
    {
      name: 'Pro',
      description: 'Para estudiantes serios que quieren aprender sin límites.',
      monthlyPrice: 29,
      annualPrice: 19,
      color: 'green',
      badge: 'Más popular',
      cta: 'Empezar Pro',
      ctaRoute: '/auth/register',
      featured: true,
      features: [
        'Todo lo de Gratis',
        'Acceso ilimitado a cursos premium',
        'Descargas para ver sin conexión',
        'Certificados verificados',
        'Soporte prioritario 24/7',
        '50 GB de almacenamiento',
        'Acceso anticipado a nuevos cursos',
      ],
      missing: [
        'Mentores personales',
      ]
    },
    {
      name: 'Premium',
      description: 'La experiencia de aprendizaje más completa y personalizada.',
      monthlyPrice: 59,
      annualPrice: 39,
      color: 'purple',
      badge: 'Completo',
      cta: 'Empezar Premium',
      ctaRoute: '/auth/register',
      featured: false,
      features: [
        'Todo lo de Pro',
        'Mentores personales',
        'Sesiones en vivo 1 a 1',
        'Almacenamiento ilimitado',
        'Reportes de rendimiento avanzados',
        'Acceso a comunidades exclusivas',
        'Garantía de devolución 30 días',
      ],
      missing: []
    },
  ];

  getPrice(plan: any): number {
    return this.billingAnnual ? plan.annualPrice : plan.monthlyPrice;
  }

  getSavings(plan: any): number {
    if (!plan.monthlyPrice) return 0;
    return Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);
  }
}
