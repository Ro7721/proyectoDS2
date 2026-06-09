import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-preview.html',
  styleUrl: './video-preview.css'
})
export class VideoPreviewComponent implements OnChanges, OnDestroy {
  @Input() videoSrc: string | null = null;
  @Input() files: File[] = [];

  videoType: 'youtube' | 'vimeo' | 'local' | 'none' = 'none';
  safeUrl: SafeResourceUrl | null = null;
  localVideoUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] || changes['files']) {
      this.processVideoSource();
    }
  }

  ngOnDestroy(): void {
    if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.localVideoUrl);
    }
  }

  private processVideoSource(): void {
    // 1. Prioritize local files if there are any that look like videos
    if (this.files && this.files.length > 0) {
      const videoFile = this.files.find(f => f.type.startsWith('video/'));
      if (videoFile) {
        if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.localVideoUrl);
        }
        this.localVideoUrl = URL.createObjectURL(videoFile);
        this.videoType = 'local';
        this.safeUrl = null;
        return;
      }
    }

    // 2. Fallback to URL parsing
    if (!this.videoSrc || this.videoSrc.trim() === '') {
      this.videoType = 'none';
      this.safeUrl = null;
      if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.localVideoUrl);
      }
      this.localVideoUrl = null;
      return;
    }

    const url = this.videoSrc.trim();

    // YouTube Matcher
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      this.videoType = 'youtube';
      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      return;
    }

    // Vimeo Matcher
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      this.videoType = 'vimeo';
      const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      return;
    }

    // Assume standard video file link
    this.videoType = 'local';
    this.localVideoUrl = url;
    this.safeUrl = null;
  }
}
