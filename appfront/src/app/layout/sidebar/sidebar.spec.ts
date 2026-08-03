import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MessageToast } from '../../message/message-toast';

describe('SidebarComponent', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let authServiceSpy: any;
  let messageToastSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      logout: vi.fn()
    };
    
    messageToastSpy = {
      toastSuccess: vi.fn()
    };
    
    routerSpy = {
      url: '/test-route',
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageToast, useValue: messageToastSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout and show toast', async () => {
    await component.logout();
    
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(messageToastSpy.toastSuccess).toHaveBeenCalledWith('Éxito', 'Cerraste sesión correctamente');
  });

  it('should emit expand on item click if collapsed', () => {
    vi.spyOn(component.expand, 'emit');
    const mockEvent = { preventDefault: vi.fn() } as unknown as Event;
    
    component.isCollapsed = true;
    component.onItemClick(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.expand.emit).toHaveBeenCalled();
  });

  it('should not emit expand on item click if not collapsed', () => {
    vi.spyOn(component.expand, 'emit');
    const mockEvent = { preventDefault: vi.fn() } as unknown as Event;
    
    component.isCollapsed = false;
    component.onItemClick(mockEvent);
    
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(component.expand.emit).not.toHaveBeenCalled();
  });

  it('should toggle submenu if not collapsed', () => {
    component.isCollapsed = false;
    
    component.toggleSubmenu('menu1');
    expect(component.isOpen('menu1')).toBeTruthy();
    
    component.toggleSubmenu('menu1');
    expect(component.isOpen('menu1')).toBeFalsy();
  });

  it('should emit expand on toggle submenu if collapsed', () => {
    vi.spyOn(component.expand, 'emit');
    const mockEvent = { preventDefault: vi.fn() } as unknown as Event;
    
    component.isCollapsed = true;
    component.toggleSubmenu('menu1', mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.expand.emit).toHaveBeenCalled();
    expect(component.isOpen('menu1')).toBeFalsy(); // Did not open
  });

  it('should determine if parent is active', () => {
    const itemWithActiveChild = {
      items: [{ route: '/test-route' }, { route: '/other' }]
    } as any;
    
    const itemWithoutActiveChild = {
      items: [{ route: '/other-route' }]
    } as any;
    
    const itemWithoutChildren = {} as any;
    
    expect(component.isParentActive(itemWithActiveChild)).toBeTruthy();
    expect(component.isParentActive(itemWithoutActiveChild)).toBeFalsy();
    expect(component.isParentActive(itemWithoutChildren)).toBeFalsy();
  });

  it('should navigate home', () => {
    component.returnHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });
});
