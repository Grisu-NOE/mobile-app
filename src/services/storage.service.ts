import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import { Settings, MagicCookie } from "../common/models";

@Injectable()
export class StorageService {

	private static readonly SETTINGS_KEY = "settings";
	private static readonly MAGIC_COOKIE_KEY = "magic-cookie";

	constructor(private storage: Storage) {}

	public saveSettings(settings: Settings): void {
		this.storage.set(StorageService.SETTINGS_KEY, settings);
	}

	public findSettings(): Promise<Settings> {
		return this.storage.get(StorageService.SETTINGS_KEY);
	}

	public saveMagicCookie(magicCookie: MagicCookie): void {
		this.storage.set(StorageService.MAGIC_COOKIE_KEY, magicCookie);
	}

	public findMagicCookie(): Promise<MagicCookie> {
		return this.storage.get(StorageService.MAGIC_COOKIE_KEY);
	}

}
