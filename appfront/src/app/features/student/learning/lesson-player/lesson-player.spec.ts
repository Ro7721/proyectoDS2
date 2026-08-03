import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LessonPlayer } from './lesson-player';
import { DomSanitizer } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';

describe('LessonPlayerComponent', () => {
  let component: LessonPlayer;
  let fixture: ComponentFixture<LessonPlayer>;
  let sanitizerSpy: any;

  beforeEach(async () => {
    sanitizerSpy = {
      bypassSecurityTrustResourceUrl: vi.fn().mockImplementation(url => url)
    };

    await TestBed.configureTestingModule({
      imports: [LessonPlayer],
      providers: [
        { provide: DomSanitizer, useValue: sanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonPlayer);
    component = fixture.componentInstance;
    
    fixture.detectChanges();

    // Mock the video element after detectChanges
    component.videoPlayer = {
      nativeElement: {
        play: vi.fn(),
        pause: vi.fn(),
        currentTime: 0,
        duration: 100,
        paused: true,
        muted: false,
        volume: 1,
        playbackRate: 1,
        closest: vi.fn().mockReturnValue({ requestFullscreen: vi.fn() }),
        buffered: {
          length: 0,
          end: vi.fn()
        }
      } as any
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore position on ngAfterViewInit', () => {
    component.lesson = { idLesson: 'l1', lastPositionSeconds: 10, watchedPercentage: 10, completed: false } as any;
    component.ngAfterViewInit();
    expect(component.videoPlayer!.nativeElement.currentTime).toBe(10);
    expect(component.percentage).toBe(10);
  });

  it('should reset state on ngOnChanges when lesson changes', async () => {
    vi.useFakeTimers();
    component.currentTime = 50;
    component.percentage = 50;
    
    component.ngOnChanges({
      lesson: new SimpleChange(null, { idLesson: 'l2' }, true)
    });

    expect(component.currentTime).toBe(0);
    expect(component.percentage).toBe(0);
    
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should toggle play', () => {
    component.togglePlay();
    expect(component.videoPlayer!.nativeElement.play).toHaveBeenCalled();
    expect(component.isPaused).toBeFalsy();
    Object.defineProperty(component.videoPlayer!.nativeElement, 'paused', { value: false, writable: true });
    component.togglePlay();
    expect(component.videoPlayer!.nativeElement.pause).toHaveBeenCalled();
    expect(component.isPaused).toBeTruthy();
  });

  it('should skip forward', () => {
    component.videoPlayer!.nativeElement.currentTime = 10;
    component.skipForward();
    expect(component.videoPlayer!.nativeElement.currentTime).toBe(20);
  });

  it('should skip backward', () => {
    component.videoPlayer!.nativeElement.currentTime = 20;
    component.skipBackward();
    expect(component.videoPlayer!.nativeElement.currentTime).toBe(10);
  });

  it('should seek based on mouse event', () => {
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, width: 100 })
      },
      clientX: 50
    } as unknown as MouseEvent;

    component.seek(mockEvent);
    // ratio = (50 - 0) / 100 = 0.5
    // duration = 100 -> currentTime = 50
    expect(component.videoPlayer!.nativeElement.currentTime).toBe(50);
  });

  it('should handle progress hover', () => {
    component.duration = 100;
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, width: 100 })
      },
      clientX: 25
    } as unknown as MouseEvent;

    component.onProgressHover(mockEvent);
    expect(component.hoverTimePercent).toBe(25);
    expect(component.hoverTime).toBe(25);
  });

  it('should toggle mute', () => {
    component.toggleMute();
    expect(component.videoPlayer!.nativeElement.muted).toBeTruthy();
    expect(component.isMuted).toBeTruthy();
  });

  it('should set volume', () => {
    const mockEvent = {
      target: { value: '0.5' }
    } as unknown as Event;

    component.setVolume(mockEvent);
    expect(component.volume).toBe(0.5);
    expect(component.videoPlayer!.nativeElement.volume).toBe(0.5);
    expect(component.isMuted).toBeFalsy();
  });

  it('should update on volume change event', () => {
    const mockVideo = { muted: true, volume: 0 } as any;
    component.onVolumeChange(mockVideo);
    expect(component.isMuted).toBeTruthy();

    const mockVideo2 = { muted: false, volume: 0.8 } as any;
    component.onVolumeChange(mockVideo2);
    expect(component.isMuted).toBeFalsy();
    expect(component.volume).toBe(0.8);
  });

  it('should set speed', () => {
    component.setSpeed(1.5);
    expect(component.playbackRate).toBe(1.5);
    expect(component.videoPlayer!.nativeElement.playbackRate).toBe(1.5);
  });

  it('should toggle fullscreen', () => {
    const mockContainer = {
      requestFullscreen: vi.fn()
    };
    component.videoPlayer!.nativeElement.closest = vi.fn().mockReturnValue(mockContainer);

    component.toggleFullscreen();
    expect(mockContainer.requestFullscreen).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', () => {
    const spaceEvent = { code: 'Space', preventDefault: vi.fn() } as any;
    vi.spyOn(component, 'togglePlay');
    
    component.onKeyDown(spaceEvent);
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(component.togglePlay).toHaveBeenCalled();

    const rightEvent = { code: 'ArrowRight', preventDefault: vi.fn() } as any;
    vi.spyOn(component, 'skipForward');
    
    component.onKeyDown(rightEvent);
    expect(rightEvent.preventDefault).toHaveBeenCalled();
    expect(component.skipForward).toHaveBeenCalled();

    const leftEvent = { code: 'ArrowLeft', preventDefault: vi.fn() } as any;
    vi.spyOn(component, 'skipBackward');
    
    component.onKeyDown(leftEvent);
    expect(leftEvent.preventDefault).toHaveBeenCalled();
    expect(component.skipBackward).toHaveBeenCalled();

    const mEvent = { code: 'KeyM', preventDefault: vi.fn() } as any;
    vi.spyOn(component, 'toggleMute');
    component.onKeyDown(mEvent);
    expect(component.toggleMute).toHaveBeenCalled();

    const fEvent = { code: 'KeyF', preventDefault: vi.fn() } as any;
    vi.spyOn(component, 'toggleFullscreen');
    component.onKeyDown(fEvent);
    expect(component.toggleFullscreen).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(NaN)).toBe('0:00');
    expect(component.formatTime(0)).toBe('0:00');
  });

  it('should get safe url', () => {
    component.getSafeUrl('http://test.com');
    expect(sanitizerSpy.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://test.com');
  });

  it('should emit progress on time update if 10s passed', () => {
    component.lesson = { idLesson: 'l1' } as any;
    vi.spyOn(component.lessonProgress, 'emit');

    const mockEvent = {
      target: {
        duration: 100,
        paused: false,
        currentTime: 10, // 10 seconds
        buffered: { length: 0 }
      }
    } as any;

    component.onTimeUpdate(mockEvent);

    expect(component.percentage).toBe(10);
    expect(component.lessonProgress.emit).toHaveBeenCalledWith({
      idLesson: 'l1',
      watchedPercentage: 10,
      lastPositionSeconds: 10,
      saveToBackend: true
    });
  });

  it('should handle onPause and emit', () => {
    component.lesson = { idLesson: 'l1' } as any;
    vi.spyOn(component.lessonProgress, 'emit');

    component.currentTime = 5;
    component.percentage = 5;

    component.onPause();

    expect(component.isPaused).toBeTruthy();
    expect(component.lessonProgress.emit).toHaveBeenCalledWith({
      idLesson: 'l1',
      watchedPercentage: 5,
      lastPositionSeconds: 5,
      saveToBackend: true
    });
  });

  it('should handle onEnded and emit', () => {
    component.lesson = { idLesson: 'l1' } as any;
    vi.spyOn(component.lessonProgress, 'emit');
    vi.spyOn(component.lessonCompleted, 'emit');

    component.currentTime = 100;
    
    component.onEnded();

    expect(component.percentage).toBe(100);
    expect(component.completed).toBeTruthy();
    expect(component.lessonProgress.emit).toHaveBeenCalled();
    expect(component.lessonCompleted.emit).toHaveBeenCalled();
  });

  it('should trigger play pulse and clear it on destroy', () => {
    vi.useFakeTimers();
    component.togglePlay();
    expect(component.showPlayPulse).toBeTruthy();
    vi.advanceTimersByTime(600);
    expect(component.showPlayPulse).toBeFalsy();
    
    component.togglePlay(); // set timer again
    component.ngOnDestroy(); // should clear it
    vi.useRealTimers();
  });

  it('should exit keyboard shortcuts for inputs', () => {
    const spaceEvent = { code: 'Space', target: { tagName: 'INPUT' } } as any;
    vi.spyOn(component, 'togglePlay');
    component.onKeyDown(spaceEvent);
    expect(component.togglePlay).not.toHaveBeenCalled();
  });

  it('should handle onLoadedMetadata', () => {
    const mockVideo = { duration: 120, paused: true } as any;
    component.onLoadedMetadata(mockVideo);
    expect(component.duration).toBe(120);
    expect(component.isPaused).toBeTruthy();
  });

  it('should exit onTimeUpdate if no duration', () => {
    const mockEvent = { target: { duration: 0 } } as any;
    component.onTimeUpdate(mockEvent);
    expect(component.currentTime).toBe(0);
  });

  it('should handle buffered ranges in onTimeUpdate', () => {
    component.lesson = { idLesson: 'l1' } as any;
    const mockEvent = {
      target: {
        duration: 100,
        paused: false,
        currentTime: 5,
        buffered: {
          length: 1,
          end: () => 50
        }
      }
    } as any;
    component.onTimeUpdate(mockEvent);
    expect(component.bufferedPercent).toBe(50);
  });

  it('should not save progress if less than 10 seconds passed', () => {
    component.lesson = { idLesson: 'l1' } as any;
    vi.spyOn(component.lessonProgress, 'emit');
    (component as any).lastSavedSecond = 5;

    const mockEvent = {
      target: {
        duration: 100,
        paused: false,
        currentTime: 7, // only 2 seconds passed since lastSavedSecond
        buffered: { length: 0 }
      }
    } as any;

    component.onTimeUpdate(mockEvent);
    expect(component.lessonProgress.emit).toHaveBeenCalledWith(expect.objectContaining({
      saveToBackend: false
    }));
  });

  it('should exit emitProgress if lesson is not set', () => {
    component.lesson = undefined;
    vi.spyOn(component.lessonProgress, 'emit');
    component.onPause();
    expect(component.lessonProgress.emit).not.toHaveBeenCalled();
  });

  it('should handle exitFullscreen in toggleFullscreen', () => {
    const mockContainer = {};
    component.videoPlayer!.nativeElement.closest = vi.fn().mockReturnValue(mockContainer);
    
    // Mock document.fullscreenElement to be truthy
    Object.defineProperty(document, 'fullscreenElement', {
      value: mockContainer,
      configurable: true,
      writable: true
    });
    document.exitFullscreen = vi.fn();

    component.toggleFullscreen();
    expect(document.exitFullscreen).toHaveBeenCalled();

    // Reset document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true
    });
  });

  it('should handle restorePosition early returns', () => {
    component.lesson = undefined;
    component.ngAfterViewInit(); // should return early and not throw
    expect(component.percentage).toBe(0);
  });
});
