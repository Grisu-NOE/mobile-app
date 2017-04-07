import {Injectable} from "@angular/core";
import {Response, Http, RequestOptionsArgs, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {AbstractHttpService} from "./abstract-http.service";
import {District, MainData, WarnState, InfoScreenData, DataState, Incident, Vote, Disposition} from "../common/models";
import * as moment from "moment";

@Injectable()
export class WastlDataService extends AbstractHttpService {

	private static readonly BASE_URL = "https://infoscreen.florian10.info/";
	private static readonly MOBILE_BASE_URL = WastlDataService.BASE_URL + "OWS/wastlMobile/";
	private static readonly INFO_SCREEN_BASE_URL = WastlDataService.BASE_URL + "OWS/Infoscreen/";

	private static readonly MAIN_DATA_URL = WastlDataService.MOBILE_BASE_URL + "getMainData.ashx";
	private static readonly INFO_SCREEN_DATA_URL = WastlDataService.INFO_SCREEN_BASE_URL + "Einsatz.ashx";
	private static readonly INFO_SCREEN_DEMO_URL = WastlDataService.INFO_SCREEN_BASE_URL + "demo.ashx";
	private static readonly INFO_SCREEN_CONFIG_URL = WastlDataService.INFO_SCREEN_BASE_URL + "config.ashx";

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
					identifier == "tulln") {
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
			let mergedDistrict2 = this.mergeMappingMembers(mapping2017["tulln"], mapping2017["klosterneuburg"]);
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

			let result = new MainData(districts, departmentCount, incidentCount, districtCount);
			console.debug("Computed main data", result);
			return result;
		});
	}

	public findInfoScreenData(useDemoData?: boolean): Observable<InfoScreenData> {
		let options: RequestOptionsArgs = {};
		let url = WastlDataService.INFO_SCREEN_DATA_URL;

		if (useDemoData) {
			let params = new URLSearchParams();
			params.set("demo", "3");
			options.search = params;

			url = WastlDataService.INFO_SCREEN_DEMO_URL;
		}

		return super.httpGet(url, (response: Response) => {
			const data = response.json();
			let dataState: DataState = DataState.fromString(data.CurrentState);
			let incidents: Incident[] = [];

			if (DataState.DATA != dataState) {
				console.debug("Cannot compute infoscreen data, state is " + dataState.value);
				return new InfoScreenData(dataState, data.Token || null, incidents);
			}

			for (let einsatz of data.EinsatzData) {
				let vote = new Vote(einsatz.Rsvp.Yes, einsatz.Rsvp.No);
				let dispositions: Disposition[] = [];

				for (let dispo of einsatz.Dispositionen) {
					dispositions.push(new Disposition(
						dispo.Name,
						dispo.EldisID,
						dispo.IsEigenalarmiert,
						this.wastlDateTimeToMoment(dispo.DispoTime),
						this.wastlDateTimeToMoment(dispo.AusTime),
						dispo.IsBackground));
				}

				incidents.push(new Incident(
					einsatz.EinsatzID,
					einsatz.Status,
					einsatz.Alarmstufe,
					einsatz.Meldebild,
					einsatz.Nummer1,
					einsatz.Nummer2,
					einsatz.Nummer3,
					einsatz.Plz,
					einsatz.Strasse,
					einsatz.Ort,
					einsatz.sector,
					einsatz.Objekt,
					einsatz.ObjektId,
					einsatz.Bemerkung,
					this.wastlDateTimeToMoment(einsatz.EinsatzErzeugt),
					einsatz.Melder,
					einsatz.MelderTelefon,
					einsatz.EinsatzNummer,
					dispositions,
					vote));
			}

			let result = new InfoScreenData(dataState, data.Token, incidents);
			console.debug("Computed infoscreen data", result);
			return result;
		}, options);
	}

	public findHomeAddress(): Observable<string> {
		return super.httpGet(WastlDataService.INFO_SCREEN_CONFIG_URL, (response: Response) => {
			const data = response.json();

			if (DataState.fromString(data.CurrentState) != DataState.DATA) {
				console.debug("Cannot fetch home address, data state is " + data.CurrentState);
				return "";
			}

			let address = response.json().Config.HomeAddress;
			console.debug("Found home address", address);
			return address;
		});
	}

	private mergeMappingMembers(to: District, from: District): District {
		if (from == null) {
			return to;
		}

		let state: WarnState;

		if (from.warnState.index > to.warnState.index) {
			state = from.warnState;
		} else {
			state = to.warnState;
		}

		return new District(to.identifier, to.name, state, from.incidents + to.incidents, from.departments + to.departments);
	}

	private wastlDateTimeToMoment(wastlDateTime: string): moment.Moment {
		if (wastlDateTime == null) {
			return null;
		}

		return moment(wastlDateTime.substring(0, 19).replace("T", " "), "YYYY-MM-DD HH:mm:ss");
	}
}

