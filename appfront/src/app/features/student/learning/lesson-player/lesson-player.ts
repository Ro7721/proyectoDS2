import {
  Component, EventEmitter, Input, Output,
  OnChanges, SimpleChanges, ViewChild, ElementRef,
  AfterViewInit, HostListener, OnDestroy
} from '@angular/core';
import { LessonContentResponse } from '../../../../models/learning.model';
import { LessonProgressEvent } from '../../course/learning-course/learning-course';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson-player',
  imports: [CommonModule],
  templateUrl: './lesson-player.html',
  styleUrl: './lesson-player.css',
})
export class LessonPlayer implements OnChanges, AfterViewInit, OnDestroy {
  @Input() lesson?: LessonContentResponse;
  @Output() lessonProgress = new EventEmitter<LessonProgressEvent>();
  @Output() lessonCompleted = new EventEmitter<void>();
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar') progressBarRef?: ElementRef<HTMLDivElement>;

  // State
  currentTime = 0;
  duration = 0;
  percentage = 0;
  bufferedPercent = 0;
  completed = false;
  buffering = false;
  isPaused = true;
  isMuted = false;
  volume = 1;
  playbackRate = 1;
  hoverTime: number | null = null;
  hoverTimePercent = 0;
  showPlayPulse = false;
  private pulseTimer?: ReturnType<typeof setTimeout>;

  private lastSavedSecond = 0;

  speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit(): void {
    this.restorePosition();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson']) {
      this.currentTime = 0;
      this.duration = 0;
      this.percentage = 0;
      this.lastSavedSecond = 0;
      this.completed = false;
      this.buffering = false;
      this.bufferedPercent = 0;
      this.isPaused = true;
      setTimeout(() => this.restorePosition());
    }
  }

  ngOnDestroy(): void {
    if (this.pulseTimer) clearTimeout(this.pulseTimer);
  }

  private restorePosition(): void {
    if (!this.lesson || !this.videoPlayer) return;
    const video = this.videoPlayer.nativeElement;
    video.currentTime = this.lesson.lastPositionSeconds ?? 0;
    video.playbackRate = this.playbackRate;
    video.volume = this.volume;
    this.completed = this.lesson.completed ?? false;
    this.percentage = this.lesson.watchedPercentage ?? 0;
  }

  // ─── Playback Controls ──────────────────────────────────────────────────────

  togglePlay(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    if (video.paused) {
      video.play();
      this.isPaused = false;
    } else {
      video.pause();
      this.isPaused = true;
    }
    this.triggerPlayPulse();
  }

  private triggerPlayPulse(): void {
    this.showPlayPulse = true;
    if (this.pulseTimer) clearTimeout(this.pulseTimer);
    this.pulseTimer = setTimeout(() => {
      this.showPlayPulse = false;
    }, 600);
  }

  skipForward(): void {
    const video = this.videoPlayer?.nativeElement;
    if (video) video.currentTime = Math.min(video.currentTime + 10, video.duration);
  }

  skipBackward(): void {
    const video = this.videoPlayer?.nativeElement;
    if (video) video.currentTime = Math.max(video.currentTime - 10, 0);
  }

  seek(event: MouseEvent): void {
    const bar = (event.currentTarget as HTMLElement);
    const rect = bar.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const video = this.videoPlayer?.nativeElement;
    if (video && video.duration) {
      video.currentTime = ratio * video.duration;
    }
  }

  onProgressHover(event: MouseEvent): void {
    const bar = (event.currentTarget as HTMLElement);
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.hoverTimePercent = ratio * 100;
    this.hoverTime = ratio * (this.duration || 0);
  }

  // ─── Volume ──────────────────────────────────────────────────────────────────

  toggleMute(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    this.volume = parseFloat(input.value);
    video.volume = this.volume;
    video.muted = this.volume === 0;
    this.isMuted = this.volume === 0;
  }

  onVolumeChange(video: HTMLVideoElement): void {
    this.isMuted = video.muted;
    if (!video.muted) this.volume = video.volume;
  }

  // ─── Speed ───────────────────────────────────────────────────────────────────

  setSpeed(rate: number): void {
    this.playbackRate = rate;
    const video = this.videoPlayer?.nativeElement;
    if (video) video.playbackRate = rate;
  }

  // ─── Fullscreen ──────────────────────────────────────────────────────────────

  toggleFullscreen(): void {
    const container = this.videoPlayer?.nativeElement?.closest('.relative') as HTMLElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (!this.videoPlayer) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.skipForward();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.skipBackward();
        break;
      case 'KeyM':
        this.toggleMute();
        break;
      case 'KeyF':
        this.toggleFullscreen();
        break;
    }
  }

  // ─── Video Events ─────────────────────────────────────────────────────────────

  onLoadedMetadata(video: HTMLVideoElement): void {
    this.duration = video.duration;
    this.isPaused = video.paused;
  }

  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (!video.duration) return;

    this.isPaused = video.paused;
    this.currentTime = video.currentTime;

    // Update buffered
    if (video.buffered.length > 0) {
      this.bufferedPercent = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
    }

    const currentSecond = Math.floor(video.currentTime);
    const newPercentage = Math.round((video.currentTime / video.duration) * 100);

    if (newPercentage !== this.percentage || currentSecond !== Math.floor(this.currentTime)) {
      this.duration = video.duration;
      this.percentage = newPercentage;

      let shouldSave = false;
      if (currentSecond > 0 && this.lastSavedSecond === 0) {
        this.lastSavedSecond = currentSecond;
        shouldSave = true;
      } else if (Math.abs(currentSecond - this.lastSavedSecond) >= 10) {
        this.lastSavedSecond = currentSecond;
        shouldSave = true;
      }
      this.emitProgress(shouldSave);
    }
  }

  onPause(): void {
    this.isPaused = true;
    this.lastSavedSecond = Math.floor(this.currentTime);
    this.emitProgress(true);
  }

  onEnded(): void {
    this.percentage = 100;
    this.completed = true;
    this.isPaused = true;
    this.lastSavedSecond = Math.floor(this.currentTime);
    this.emitProgress(true);
    this.lessonCompleted.emit();
  }

  private emitProgress(saveToBackend = false): void {
    if (!this.lesson) return;
    this.lessonProgress.emit({
      idLesson: this.lesson.idLesson,
      watchedPercentage: this.percentage,
      lastPositionSeconds: Math.floor(this.currentTime),
      saveToBackend,
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
