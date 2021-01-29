import { Injectable } from "@angular/core";
import { AbstractHttpService } from "./abstract-http.service";
import { Http, RequestOptionsArgs, Response, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { GeoCodeResponse, WastlHydrant, WastlHydrantType } from "../common/models";

@Injectable()
export class GeoService extends AbstractHttpService {

	private static readonly GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
    private static readonly WASTL_HAYDRANTS_URL = "https://secure.florian10.info/ows/infoscreen/geo/umkreis.ashx";

	constructor(http: Http) {
		super(http);
	}

	public geocode(address: string): Observable<GeoCodeResponse> {
		const options: RequestOptionsArgs = {};
		const params = new URLSearchParams();

		params.set("address", address);
		options.search = params;

		console.debug("Geocode " + address);

		return super.httpGet(GeoService.GEOCODE_URL, (response: Response) => {
			const data = response.json();

			if (data.results.length == 0) {
				console.debug("No geocoding results found for " + address);
				return null;
			}

			return new GeoCodeResponse(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
		}, options);
	}

	public findWastlHydrantsForPosition(latitude: string, longitude: string): Observable<WastlHydrant[]> {
		const params = new URLSearchParams();
		params.set("lat", latitude);
		params.set("lng", longitude);

		console.debug("Find WASTL hydrants for position " + params.toString());

		return super.httpGet(GeoService.WASTL_HAYDRANTS_URL, (response: Response) => {
			const data = response.json();

			if (data.points.length == 0) {
				console.debug("No WASTL hydrants found for position " + latitude + ", " + longitude);
				return [];
			}

			let result: WastlHydrant[] = [];
			for (let hyd of data.points) {
				result.push(new WastlHydrant(hyd.lat, hyd.lng, WastlHydrantType.fromString(hyd.typ), hyd.txt, hyd.dis, hyd.adr, hyd.eid));
			}
			return result;
		}, { search: params });
	}
}
