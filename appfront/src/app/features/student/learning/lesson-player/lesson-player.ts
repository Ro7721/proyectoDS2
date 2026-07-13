import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LessonContentResponse } from '../../../../models/learning.model';
import { LessonProgressEvent } from '../../course/learning-course/learning-course';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-player',
  imports: [CommonModule],
  templateUrl: './lesson-player.html',
  styleUrl: './lesson-player.css',
})
export class LessonPlayer implements OnChanges, AfterViewInit {
  @Input() lesson?: LessonContentResponse;
  @Output() lessonProgress = new EventEmitter<LessonProgressEvent>();
  @Output() lessonCompleted = new EventEmitter<void>();
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  currentTime = 0;
  duration = 0;
  percentage = 0;
  private lastSavedSecond = 0;

  ngAfterViewInit(): void {
    this.restorePosition();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson']) {
      this.currentTime = 0;
      this.duration = 0;
      this.percentage = 0;
      this.lastSavedSecond = 0;

      setTimeout(() => this.restorePosition());
    }
  }
  private restorePosition(): void {
    if (!this.lesson || !this.videoPlayer) return;
    const video = this.videoPlayer.nativeElement;
    video.currentTime = this.lesson.lastPositionSeconds ?? 0;
  }

  onLoadedMetadata(video: HTMLVideoElement): void {
    this.duration = video.duration;
  }

  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (!video.duration) return;
    this.currentTime = video.currentTime;
    this.duration = video.duration;
    this.percentage = Math.round((video.currentTime / video.duration) * 100);
    const currentSecond = Math.floor(video.currentTime);
    if (currentSecond - this.lastSavedSecond >= 10) {
      this.lastSavedSecond = currentSecond;
      this.emitProgress();
    }
  }
  onPause(): void {
    this.emitProgress();
  }

  onEnded(): void {
    this.percentage = 100;
    this.emitProgress();
    this.lessonCompleted.emit();
  }
  private emitProgress(): void {
    if (!this.lesson) return;
    this.lessonProgress.emit({
      idLesson: this.lesson.idLesson,
      watchedPercentage: this.percentage,
      lastPositionSeconds: Math.floor(this.currentTime)
    });

  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;

  }
}
