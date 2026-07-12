import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';
import { CourseContentResponse } from '../../../models/learning.model';

export interface ApiCourseContent$Params {
  idCourse: string;
}

export function apiCourseContent(
  http: HttpClient,
  rootUrl: string,
  params: ApiCourseContent$Params,
  context?: HttpContext
): Observable<StrictHttpResponse<CourseContentResponse>> {

  const rb = new RequestBuilder(rootUrl, apiCourseContent.PATH, 'get');

  if (params) {
    rb.path('idCourse', params.idCourse, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<CourseContentResponse>;
    })
  );
}

apiCourseContent.PATH = '/learning/course-content/{idCourse}';