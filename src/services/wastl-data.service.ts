import {Injectable} from "@angular/core";
import {Response, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {AbstractHttpService} from "./abstract-http.service";
import {District, MainData, WarnState} from "../common/models";

@Injectable()
export class WastlDataService extends AbstractHttpService {

	private static readonly MOBILE_BASE_URL = "https://infoscreen.florian10.info/OWS/wastlMobile/";
	private static readonly MAIN_DATA_URL = WastlDataService.MOBILE_BASE_URL + "getMainData.ashx";

	private static readonly DISTRICT_MAPPING = {
		"" : "LWZ",
		"01": "amstetten",
		"02": "baden",
		"03": "bruck-leitha",
		"04": "gaenserndorf",
		"05": "gmuend",
		"061": "klosterneuburg",
		"062": "purkersdorf",
		"063": "schwechat",
		"07": "hollabrunn",
		"08": "horn",
		"09": "stockerau",
		"10": "krems",
		"11": "lilienfeld",
		"12": "melk",
		"13": "mistelbach",
		"14": "moedling",
		"15": "neunkirchen",
		"17": "st-poelten",
		"18": "scheibbs",
		"19": "tulln",
		"20": "waidhofen-thaya",
		"21": "wr-neustadt",
		"22": "zwettl"
	};

	constructor(http: Http) {
		super(http);
	}

	public findMainData(): Observable<MainData> {
		return super.httpGet(WastlDataService.MAIN_DATA_URL, (response: Response) => {
			const data = response.json();

			let districts: District[] = [];
			let departmentCount = 0;
			let incidentCount = 0;
			let districtCount = 0;

			let mapping2017 = {};

			for (let district of data.Bezirke) {
				departmentCount += district.f;
				incidentCount += district.e;

				let identifier = WastlDataService.DISTRICT_MAPPING[district.k];

				// workaround code start
				if (identifier == "klosterneuburg" ||
					identifier == "purkersdorf" ||
					identifier == "schwechat" ||
					identifier == "bruck-leitha" ||
					identifier == "st-poelten" ||
					identifier == "stockerau") {
					mapping2017[identifier] = new District(identifier, district.t, WarnState.fromIndex(district.z), district.e, district.f);
				} else {
				// workaround code end
					districts.push(new District(identifier, district.t, WarnState.fromIndex(district.z), district.e, district.f));

					if (district.z > 0) {
						districtCount++;
					}
				}
			}

			// workaround code start
			let mergedDistrict1 = this.mergeMappingMembers(mapping2017["st-poelten"], mapping2017["purkersdorf"]);
			if (mergedDistrict1.warnState.index > 0) {
				districtCount++;
			}
			districts.push(mergedDistrict1);
			let mergedDistrict2 = this.mergeMappingMembers(mapping2017["stockerau"], mapping2017["klosterneuburg"]);
			if (mergedDistrict2.warnState.index > 0) {
				districtCount++;
			}
			districts.push(mergedDistrict2);
			let mergedDistrict3 = this.mergeMappingMembers(mapping2017["bruck-leitha"], mapping2017["schwechat"]);
			if (mergedDistrict3.warnState.index > 0) {
				districtCount++;
			}
			districts.push(mergedDistrict3);
			// workaround code end

			return new MainData(districts, departmentCount, incidentCount, districtCount);
		});
	}

	private mergeMappingMembers(to: District, from: District): District {
		let state: WarnState;

		if (from.warnState.index > to.warnState.index) {
			state = from.warnState;
		} else {
			state = to.warnState;
		}

		return new District(to.identifier, to.name, state, from.incidents + to.incidents, from.departments + to.departments);
	}
}

