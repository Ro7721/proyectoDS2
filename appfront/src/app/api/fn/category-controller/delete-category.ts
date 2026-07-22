/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';
import { ApiResponseBoolean } from '../../models/api-response-boolean';

export interface DeleteCategory$Params {
  idCategory: string;
}

export function deleteCategory(http: HttpClient, rootUrl: string, params: DeleteCategory$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseBoolean>> {
  const rb = new RequestBuilder(rootUrl, deleteCategory.PATH, 'delete');
  if (params) {
    rb.path('idCategory', params.idCategory, {});
  }
  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseBoolean>;
    })
  );
}

deleteCategory.PATH = '/categories/delete/{idCategory}';
