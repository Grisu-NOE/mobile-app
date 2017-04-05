import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";
import {InAppBrowser} from "@ionic-native/in-app-browser";

@Component({
	selector: "about-modal",
	templateUrl: "about.html"
})
export class AboutModal {

	private date: Date;

	constructor(private viewController: ViewController, private browser: InAppBrowser) {
		this.date = new Date();
	}

	public close(): void {
		this.viewController.dismiss();
	}

	public easterEggTap(): void {
		// TODO: handle easter egg
	}

	public openUrl(url: string) {
		this.browser.create(url, "_system");
	}
}
