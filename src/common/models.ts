import * as moment from "moment";

export class District {
	public readonly identifier: string;
	public readonly name: string;
	public readonly warnState: WarnState;
	public readonly incidents: number;
	public readonly departments: number;

	constructor(identifier: string, name: string, warnState: WarnState, incidents: number, departments: number) {
		this.identifier = identifier;
		this.name = name;
		this.warnState = warnState;
		this.incidents = incidents;
		this.departments = departments;
	}
}

export class MainData {
	public readonly districts: District[];
	public readonly departmentCount: number;
	public readonly incidentCount: number;
	public readonly districtCount: number;
	public readonly currentHistory: HistoryEntry[];
	public readonly history12h: HistoryEntry[];
	public readonly history24h: HistoryEntry[];

	constructor(
		districts: District[],
		departmentCount: number,
		incidentCount: number,
		districtCount: number,
		currentHistory: HistoryEntry[],
		history12h: HistoryEntry[],
		history24h: HistoryEntry[]) {

		this.districts = districts;
		this.departmentCount = departmentCount;
		this.incidentCount = incidentCount;
		this.districtCount = districtCount;
		this.currentHistory = currentHistory;
		this.history12h = history12h;
		this.history24h = history24h;
	}
}

export class WarnState {
	public static readonly NONE = new WarnState("none", 0);
	public static readonly LOW = new WarnState("low", 1);
	public static readonly MEDIUM = new WarnState("medium", 2);
	public static readonly HIGH = new WarnState("high", 3);

	private constructor(public value: string, public index: number) { }

	public static all(): WarnState[] {
		return [WarnState.NONE, WarnState.LOW, WarnState.MEDIUM, WarnState.HIGH];
	}

	public static fromIndex(index: number): WarnState {
		for (let warnState of this.all()) {
			if (warnState.index == index) {
				return warnState;
			}
		}
		throw new Error("Cannot find WarnState for index " + index);
	}
}

export interface Settings {
	myDistrict: string;
	jumpToDistrict: boolean;
	showIncidentDistance: boolean;
	showIncidentHydrants: boolean;
	showExtendedIncidentData: boolean;
}

export class InfoScreenData {
	public readonly state: DataState;
	public readonly token: string;
	public readonly incidents: Incident[];

	constructor(state: DataState, token: string, incidents: Incident[]) {
		this.state = state;
		this.token = token;
		this.incidents = incidents;
	}
}

export class DataState {
	public static readonly DATA = new DataState("data");
	public static readonly TOKEN = new DataState("token");
	public static readonly WAITING = new DataState("waiting");
	public static readonly ERROR = new DataState("error");

	private constructor(public value: string) { }

	private static all(): DataState[] {
		return [DataState.DATA, DataState.TOKEN, DataState.WAITING, DataState.ERROR];
	}

	public static fromString(examinee: string): DataState {
		for (let dataState of this.all()) {
			if (dataState.value == examinee) {
				return dataState;
			}
		}
		throw new Error("Cannot find DataState for examinee string " + examinee);
	}
}

export class Incident {
	public readonly id: string;
	public readonly state: number;
	public readonly type: AlarmType;
	public readonly phrase: string;
	public readonly number1: string;
	public readonly number2: string;
	public readonly number3: string;
	public readonly zip: string;
	public readonly street: string;
	public readonly city: string;
	public readonly sector: string;
	public readonly object: string;
	public readonly objectId: string;
	public readonly comment: string;
	public readonly created: moment.Moment;
	public readonly detector: string;
	public readonly detectorTel: string;
	public readonly incidentNumber: number;
	public readonly dispositions: Disposition[];
	public readonly vote: Vote;

	constructor(
		id: string,
		state: number,
		type: AlarmType,
		phrase: string,
		number1: string,
		number2: string,
		number3: string,
		zip: string,
		street: string,
		city: string,
		sector: string,
		object: string,
		objectId: string,
		comment: string,
		created: moment.Moment,
		detector: string,
		detectorTel: string,
		incidentNumber: number,
		dispositions: Disposition[],
		vote: Vote
	) {
		this.id = id;
		this.state = state;
		this.type = type;
		this.phrase = phrase;
		this.number1 = number1;
		this.number2 = number2;
		this.number3 = number3;
		this.zip = zip;
		this.street = street;
		this.city = city;
		this.sector = sector;
		this.object = object;
		this.objectId = objectId;
		this.comment = comment;
		this.created = created;
		this.detector = detector;
		this.detectorTel = detectorTel;
		this.incidentNumber = incidentNumber;
		this.dispositions = dispositions;
		this.vote = vote;
	}
}

export class Disposition {
	public readonly name: string;
	public readonly eldisId: number;
	public readonly selfAlarmed: boolean;
	public readonly dispoTime: moment.Moment;
	public readonly ausTime: moment.Moment;
	public readonly background: boolean;

	constructor(name: string, eldisId: number, selfAlarmed: boolean, dispoTime: moment.Moment, ausTime: moment.Moment, background: boolean) {
		this.name = name;
		this.eldisId = eldisId;
		this.selfAlarmed = selfAlarmed;
		this.dispoTime = dispoTime;
		this.ausTime = ausTime;
		this.background = background;
	}
}

export class Vote {
	public readonly yes: number;
	public readonly no: number;

	constructor(yes: number, no: number) {
		this.yes = yes;
		this.no = no;
	}
}

export interface MagicCookie {
	value: string,
	active: boolean
}

export interface MapCircle {
	radius: number,
	color: string
}

export class GeoCodeResponse {
	public readonly latitude: number;
	public readonly longitude: number;

	constructor(longitude: number, latitude: number) {
		this.latitude = latitude;
		this.longitude = longitude;
	}
}

export class WastlHydrantType {
	public static readonly OF = new WastlHydrantType("OF", "Oberflurhydrant");
	public static readonly BA = new WastlHydrantType("BA", "Bach");
	public static readonly BRUNNEN = new WastlHydrantType("BRUNNEN", "Brunnen");
	public static readonly LT = new WastlHydrantType("LT", "Löschteich");
	public static readonly LWBH = new WastlHydrantType("LWBH", "Löschwasserbehäter");
	public static readonly PU = new WastlHydrantType("PU", "Pumpe");
	public static readonly SL = new WastlHydrantType("SL", "Steigleitung");
	public static readonly SS = new WastlHydrantType("SS", "Saugstelle");
	public static readonly UF = new WastlHydrantType("UF", "Unterflurhydrant");

	private constructor(public value: string, public translation: string) { }

	private static all(): WastlHydrantType[] {
		return [
			WastlHydrantType.OF,
			WastlHydrantType.BA,
			WastlHydrantType.BRUNNEN,
			WastlHydrantType.LT,
			WastlHydrantType.LWBH,
			WastlHydrantType.PU,
			WastlHydrantType.SL,
			WastlHydrantType.SS,
			WastlHydrantType.UF
		];
	}

	public static fromString(examinee: string): WastlHydrantType {
		for (let hydrantType of this.all()) {
			if (hydrantType.value == examinee) {
				return hydrantType;
			}
		}
		throw new Error("Cannot find WastlHydrantType for examinee string " + examinee);
	}
}

export class WastlHydrant {
	public readonly latitude: number;
	public readonly longitude: number;
	public readonly type: WastlHydrantType;
	public readonly description: string;
	public readonly distance: number;
	public readonly address: string;
	public readonly id: string;

	constructor(latitude: number, longitude: number, type: WastlHydrantType, description: string, distance: number, address: string, id: string) {
		this.latitude = latitude;
		this.longitude = longitude;
		this.type = type;
		this.description = description;
		this.distance = distance;
		this.address = address;
		this.id = id;
	}
}

export class HistoryEntry {
	public readonly type: AlarmType;
	public readonly phrase: string;
	public readonly count: number;
	public readonly hasPhrase: boolean;

	constructor(type: AlarmType, phrase: string, count: number) {
		this.type = type;
		this.phrase = phrase;
		this.count = count;

		this.hasPhrase = phrase != "unspezifiziert";
	}
}

export class AlarmType {
	public static readonly T1 = new AlarmType("T1");
	public static readonly T2 = new AlarmType("T2");
	public static readonly T3 = new AlarmType("T3");
	public static readonly B1 = new AlarmType("B1");
	public static readonly B2 = new AlarmType("B2");
	public static readonly B3 = new AlarmType("B3");
	public static readonly B4 = new AlarmType("B4");
	public static readonly S1 = new AlarmType("S1");
	public static readonly S2 = new AlarmType("S2");
	public static readonly S3 = new AlarmType("S3");

	private constructor(public value: string) { }

	public static all(): AlarmType[] {
		return [
			AlarmType.T1,
			AlarmType.T2,
			AlarmType.T3,
			AlarmType.B1,
			AlarmType.B2,
			AlarmType.B3,
			AlarmType.B4,
			AlarmType.S1,
			AlarmType.S2,
			AlarmType.S3
		];
	}

	public static fromString(examinee: string): AlarmType {
		for (let alarmType of this.all()) {
			if (alarmType.value == examinee) {
				return alarmType;
			}
		}
		throw new Error("Cannot find AlarmType for examinee string " + examinee);
	}
}
