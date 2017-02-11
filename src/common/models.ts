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

	private constructor(public value: string, public index: number) {}

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
