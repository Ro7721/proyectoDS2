import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoPreviewComponent } from './video-preview';
import { SimpleChange } from '@angular/core';

describe('VideoPreviewComponent', () => {
  let component: VideoPreviewComponent;
  let fixture: ComponentFixture<VideoPreviewComponent>;

  beforeEach(async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    await TestBed.configureTestingModule({
      imports: [VideoPreviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process YouTube URL correctly', () => {
    component.videoSrc = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    component.ngOnChanges({
      videoSrc: new SimpleChange(null, component.videoSrc, true)
    });

    expect(component.videoType).toBe('youtube');
    expect(component.safeUrl).toBeDefined();
  });

  it('should process Vimeo URL correctly', () => {
    component.videoSrc = 'https://vimeo.com/805175510';
    component.ngOnChanges({
      videoSrc: new SimpleChange(null, component.videoSrc, true)
    });

    expect(component.videoType).toBe('vimeo');
    expect(component.safeUrl).toBeDefined();
  });

  it('should process local URL correctly', () => {
    component.videoSrc = 'https://example.com/video.mp4';
    component.ngOnChanges({
      videoSrc: new SimpleChange(null, component.videoSrc, true)
    });

    expect(component.videoType).toBe('local');
    expect(component.localVideoUrl).toBe('https://example.com/video.mp4');
  });

  it('should handle empty or null videoSrc', () => {
    component.videoSrc = '   ';
    component.ngOnChanges({
      videoSrc: new SimpleChange(null, component.videoSrc, true)
    });

    expect(component.videoType).toBe('none');
    expect(component.localVideoUrl).toBeNull();
  });

  it('should process local video file input', () => {
    const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    component.files = [file];
    component.ngOnChanges({
      files: new SimpleChange(null, component.files, true)
    });

    expect(component.videoType).toBe('local');
    expect(component.localVideoUrl).toBe('blob:mock-url');
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it('should revoke object URL on destroy', () => {
    component.localVideoUrl = 'blob:mock-url';
    component.ngOnDestroy();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
