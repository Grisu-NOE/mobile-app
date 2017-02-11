import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {StatusBar, Splashscreen} from "ionic-native";

import {TabsPage} from "../pages/tabs/tabs.page";

@Component({
	templateUrl: "app.html"
})
export class GrisuApp {
	rootPage = TabsPage;

	constructor(platform: Platform) {
		platform.ready().then(() => {
			this.init();
		});
	}

	private init(): void {
		StatusBar.styleDefault();
		Splashscreen.hide();
	}
}
