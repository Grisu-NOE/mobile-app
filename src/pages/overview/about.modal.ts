import { Component } from "@angular/core";
import { ViewController, PopoverController } from "ionic-angular";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { EasterEggPopover } from "./easteregg.popover";

@Component({
	selector: "about-modal",
	templateUrl: "about.html"
})
export class AboutModal {

	private date: Date;
	private easterEggTaps: number = 0;

	constructor(private viewController: ViewController, private browser: InAppBrowser, private popoverController: PopoverController) {
		this.date = new Date();
	}

	public close(): void {
		this.viewController.dismiss();
	}

	public easterEggTap(): void {
		this.easterEggTaps++;
		if (this.easterEggTaps > 10) {
            this.easterEggTaps = 0;
            this.popoverController.create(EasterEggPopover).present();
        }
	}

	public openUrl(url: string) {
		this.browser.create(url, "_system");
	}
}
