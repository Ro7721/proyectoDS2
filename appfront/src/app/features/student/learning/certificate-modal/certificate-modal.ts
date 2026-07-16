import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate-modal',
  imports: [CommonModule],
  templateUrl: './certificate-modal.html',
  styleUrl: './certificate-modal.css',
})
export class CertificateModal implements OnChanges {
  @Input() visible = false;
  @Input() studentName = '';
  @Input() courseName = '';
  @Input() teacherName = '';
  @Input() totalLessons = 0;
  @Input() completedAt?: string;

  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() certId = '';
  completionDate = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['completedAt'] || changes['studentName'] || changes['courseName'] || changes['certId']) {
      this.updateCertData();
    }
  }

  private updateCertData(): void {
    if (this.completedAt) {
      this.completionDate = new Date(this.completedAt).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      this.completionDate = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (!this.certId) {
      this.certId = this.generateCertId();
    }
  }

  get teacherInitials(): string {
    if (!this.teacherName) return '?';
    return this.teacherName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.close();
    }
  }

  downloadPDF(): void {
    const style = document.createElement('style');
    style.id = 'print-cert-style';
    style.textContent = `
      @media print {
        body > *:not(.print-wrapper) { visibility: hidden; }
        .certificate-printable-area, .certificate-printable-area * { visibility: visible; }
        .certificate-printable-area {
          position: fixed !important;
          top: 0; left: 0;
          width: 297mm !important; /* A4 width */
          height: 210mm !important; /* A4 height */
          max-width: none !important;
          margin: 0 !important;
          box-shadow: none !important;
          display: flex !important;
          flex-direction: row !important;
          transform: scale(1) !important;
          background: white !important;
        }
        .no-print { display: none !important; }
        @page { margin: 0; size: A4 landscape; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById('print-cert-style')?.remove(), 1500);
  }

  private generateCertId(): string {
    const input = `${this.studentName}-${this.courseName}-${Date.now()}`;
    const hash = input.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return `CERT-${hash.toString(16).toUpperCase().slice(0, 8)}-${new Date().getFullYear()}`;
  }
}
