import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {Settings} from "../common/models";

@Injectable()
export class StorageService {

	private static readonly SETTINGS_KEY = "settings";

	constructor(private storage: Storage) {}

	public saveSettings(settings: Settings): void {
		this.storage.set(StorageService.SETTINGS_KEY, settings);
	}

	public findSettings(): Promise<Settings> {
		return this.storage.get(StorageService.SETTINGS_KEY);
	}

}
