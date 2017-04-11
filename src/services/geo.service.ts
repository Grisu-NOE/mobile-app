import { Injectable } from "@angular/core";
import { AbstractHttpService } from "./abstract-http.service";
import { Http } from "@angular/http";

@Injectable()
export class GeoService extends AbstractHttpService {

	constructor(http: Http) {
		super(http);
	}
}
