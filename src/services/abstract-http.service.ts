import {Response, Http, RequestOptionsArgs} from "@angular/http";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/observable/throw";

export abstract class AbstractHttpService {

	private static readonly TIMEOUT = 20000;

	constructor(protected http: Http) {}

	private handleError(errorResponse: Response): ErrorObservable {
		console.error("HTTP error", errorResponse);

		if (errorResponse.status == 0) {
			return Observable.throw("Server kann nicht erreicht werden. Statuscode 0.");
		}

		return Observable.throw(`Status ${errorResponse.status} - ${errorResponse.statusText}`);
	}

	protected httpGet<T>(url: string, extractionCallback: (response: Response) => T, options?: RequestOptionsArgs): Observable<T> {
		return this.http.get(url, options).timeout(AbstractHttpService.TIMEOUT).map(extractionCallback).catch(this.handleError);
	}
}
