import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { LessonContentResponse } from '../../../../models/learning.model';
import { LessonProgressEvent } from '../../course/learning-course/learning-course';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-player',
  imports: [CommonModule],
  templateUrl: './lesson-player.html',
  styleUrl: './lesson-player.css',
})
export class LessonPlayer implements OnChanges {
  @Input() lesson?: LessonContentResponse;
  @Output() lessonProgress = new EventEmitter<LessonProgressEvent>();

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  private lastEmittedPercentage = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson']) {
      this.lastEmittedPercentage = 0;
    }
  }

  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (!video.duration) return;

    const current = video.currentTime;
    const duration = video.duration;
    const percentage = Math.floor((current / duration) * 100);

    // Emit every 5% to avoid spamming, or if it reaches the end
    if (percentage >= this.lastEmittedPercentage + 5 || percentage === 100) {
      this.lastEmittedPercentage = percentage;
      this.emitProgress(percentage, Math.floor(current));
    }
  }

  onEnded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.emitProgress(100, Math.floor(video.duration));
  }

  private emitProgress(percentage: number, position: number): void {
    if (this.lesson) {
      this.lessonProgress.emit({
        idLesson: this.lesson.idLesson,
        watchedPercentage: percentage,
        lastPositionSeconds: position
      });
    }
  }
}
