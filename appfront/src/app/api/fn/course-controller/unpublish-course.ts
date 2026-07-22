/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';
import { ApiResponseCourseResponse } from '../../models/api-response-course-response';

export interface UnpublishCourse$Params {
  idCourse: string;
}

export function unpublishCourse(http: HttpClient, rootUrl: string, params: UnpublishCourse$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseCourseResponse>> {
  const rb = new RequestBuilder(rootUrl, unpublishCourse.PATH, 'patch');
  if (params) {
    rb.path('idCourse', params.idCourse, {});
  }
  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseCourseResponse>;
    })
  );
}

unpublishCourse.PATH = '/courses/unpublish/{idCourse}';
