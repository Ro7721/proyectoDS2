import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { LessonResponse } from '../../../../models/course.model';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { Api } from '../../../../api/api';
import { apigetlessonsbycourseandteacher, apigetlessonsbyteacher } from '../../../../api/functions';
@Component({
  selector: 'app-lesson-getall',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule
  ],
  templateUrl: './lesson-getall.html',
  styleUrl: './lesson-getall.css',
})
export class LessonGetall implements OnInit {
  private http = inject(HttpClient);

  lessons: LessonResponse[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  searchSubject = new Subject<string>();

  constructor(private api: Api) {

  }
  ngOnInit() {
    this.loadLessons();

    // Configurar el debounce para la búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim() === '') {
        this.loadLessons();
      } else {
        this.searchLessons(query);
      }
    });
  }

  loadLessons() {

  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  searchLessons(query: string) {
    this.loading = true;

  }

  getThumbnail(lesson: LessonResponse): string {
    if (lesson.files && lesson.files.length > 0) {
      // Buscar una imagen si es posible
      const imageFile = lesson.files.find(f => f.fileType?.includes('image') || f.fileName.match(/\.(jpeg|jpg|gif|png)$/) != null);
      if (imageFile) {
        return imageFile.fileUrl;
      }
    }
    // Retornar un placeholder o dejar vacio
    return 'https://placehold.co/100x60/e2e8f0/64748b?text=Lección';
  }

  getSeverity(isFree: boolean): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return isFree ? 'success' : 'warn';
  }

  getTypeIcon(type: string): string {
    const t = type?.toLowerCase() || '';
    if (t.includes('video')) return 'pi pi-video';
    if (t.includes('pdf') || t.includes('doc')) return 'pi pi-file-pdf';
    return 'pi pi-file';
  }
}
