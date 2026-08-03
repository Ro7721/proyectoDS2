import 'zone.js';
import 'zone.js/testing';
const g: any = typeof window !== 'undefined' ? window : globalThis;
if (typeof g.Zone === 'undefined' && typeof (globalThis as any).Zone !== 'undefined') {
  g.Zone = (globalThis as any).Zone;
}

import { getTestBed } from '@angular/core/testing';
/*import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);*/
