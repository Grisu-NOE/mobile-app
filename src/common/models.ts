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
	public districts: District[];
	public departmentCount: number;
	public incidentCount: number;
	public districtCount: number;

	constructor(districts: District[], departmentCount: number, incidentCount: number, districtCount: number) {
		this.districts = districts;
		this.departmentCount = departmentCount;
		this.incidentCount = incidentCount;
		this.districtCount = districtCount;
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
	public readonly type: string;
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
		type: string,
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
