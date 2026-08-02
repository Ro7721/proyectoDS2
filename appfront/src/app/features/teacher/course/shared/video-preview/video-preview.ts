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

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoSrc'] || changes['files']) {
      this.processVideoSource();
    }
  }

  ngOnDestroy(): void {
    if (this.localVideoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.localVideoUrl);
    }
  }

  private processVideoSource(): void {
    if (this.tryProcessLocalFiles()) return;

    if (!this.videoSrc?.trim()) {
      this.clearVideo();
      return;
    }

    const url = this.videoSrc.trim();
    if (this.tryProcessYouTube(url)) return;
    if (this.tryProcessVimeo(url)) return;

    // Assume standard video file link
    this.videoType = 'local';
    this.localVideoUrl = url;
    this.safeUrl = null;
  }

  private tryProcessLocalFiles(): boolean {
    if (!this.files?.length) return false;
    
    const videoFile = this.files.find(f => f.type.startsWith('video/'));
    if (videoFile) {
      if (this.localVideoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(this.localVideoUrl);
      }
      this.localVideoUrl = URL.createObjectURL(videoFile);
      this.videoType = 'local';
      this.safeUrl = null;
      return true;
    }
    return false;
  }

  private clearVideo(): void {
    this.videoType = 'none';
    this.safeUrl = null;
    if (this.localVideoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.localVideoUrl);
    }
    this.localVideoUrl = null;
  }

  private tryProcessYouTube(url: string): boolean {
    const ytRegex = /(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = ytRegex.exec(url);
    if (match?.[1]) {
      this.videoType = 'youtube';
      const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl); // NOSONAR
      return true;
    }
    return false;
  }

  private tryProcessVimeo(url: string): boolean {
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
    const match = vimeoRegex.exec(url);
    if (match?.[1]) {
      this.videoType = 'vimeo';
      const embedUrl = `https://player.vimeo.com/video/${match[1]}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl); // NOSONAR
      return true;
    }
    return false;
  }
}
