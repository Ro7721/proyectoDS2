import { Component, Input } from '@angular/core';
import { LessonFileResponse } from '../../../../models/learning.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-resource',
  imports: [CommonModule],
  templateUrl: './lesson-resource.html',
  styleUrl: './lesson-resource.css',
})
export class LessonResource {
  @Input() files?: LessonFileResponse[];

  getIconForType(type: string): string {
    if (!type) return 'insert_drive_file';
    type = type.toUpperCase();
    if (type.includes('PDF')) return 'picture_as_pdf';
    if (type.includes('DOC') || type.includes('TXT')) return 'description';
    if (type.includes('ZIP') || type.includes('RAR')) return 'folder_zip';
    if (type.includes('IMG') || type.includes('PNG') || type.includes('JPG')) return 'image';
    return 'insert_drive_file';
  }
}
