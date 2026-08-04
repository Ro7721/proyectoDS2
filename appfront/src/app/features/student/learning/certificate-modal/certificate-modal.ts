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
  isGeneratingPDF = false;

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
    this.isGeneratingPDF = true;
    const element = document.querySelector('.certificate-printable-area') as HTMLElement;
    if (!element) {
      this.isGeneratingPDF = false;
      return;
    }

    import('html2canvas').then(({ default: html2canvas }) => {
      return html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
    }).then((canvas) => {
      return import('jspdf').then(({ jsPDF }) => {
        const imgData = canvas.toDataURL('image/png');
        // A4 landscape: 297mm x 210mm
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const safeName = this.courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`certificado-${safeName}.pdf`);
      });
    }).catch((err) => {
      console.error('Error generando PDF:', err);
      // Fallback al método de impresión
      this.printFallback();
    }).finally(() => {
      this.isGeneratingPDF = false;
    });
  }

  private printFallback(): void {
    const style = document.createElement('style');
    style.id = 'print-cert-style';
    style.textContent = `
      @media print {
        body > *:not(.print-wrapper) { visibility: hidden; }
        .certificate-printable-area, .certificate-printable-area * { visibility: visible; }
        .certificate-printable-area {
          position: fixed !important;
          top: 0; left: 0;
          width: 297mm !important;
          height: 210mm !important;
          max-width: none !important;
          margin: 0 !important;
          box-shadow: none !important;
          display: flex !important;
          flex-direction: row !important;
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
    const hash = input.split('').reduce((a, c) => a + (c.codePointAt(0) || 0), 0);
    return `CERT-${hash.toString(16).toUpperCase().slice(0, 8)}-${new Date().getFullYear()}`;
  }
}
