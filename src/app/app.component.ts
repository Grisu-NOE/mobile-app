import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {TabsPage} from "../pages/tabs/tabs.page";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

@Component({
	templateUrl: "app.html"
})
export class GrisuApp {
	rootPage = TabsPage;

	constructor(platform: Platform, private splashScreen: SplashScreen, private statusBar: StatusBar) {
		platform.ready().then(() => {
			this.init();
		});
	}

	private init(): void {
		this.statusBar.styleDefault();
		this.splashScreen.hide();
	}
}
