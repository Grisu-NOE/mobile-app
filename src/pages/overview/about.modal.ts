import {Component} from "@angular/core";
import {ViewController} from "ionic-angular";
import {InAppBrowser} from "ionic-native";

@Component({
	selector: "about-modal",
	templateUrl: "about.html"
})
export class AboutModal {

	private date: Date;

	constructor(private viewController: ViewController) {
		this.date = new Date();
	}

	public close(): void {
		this.viewController.dismiss();
	}

	public easterEggTap(): void {
		// TODO: handle easter egg
	}

	public openUrl(url: string) {
		new InAppBrowser(url, "_system");
	}
}
