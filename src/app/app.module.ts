import { NgModule, ErrorHandler } from "@angular/core";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { GrisuApp } from "./app.component";
import { OverviewPage } from "../pages/overview/overview.page";
import { DistrictsPage } from "../pages/districts/districts.page";
import { StatisticsPage } from "../pages/statistics/statistics.page";
import { WaterPage } from "../pages/water/water.page";
import { TabsPage } from "../pages/tabs/tabs.page";
import { GrisuRefresherContentComponent } from "../components/grisu-refresher-content.component";
import { WastlDataService } from "../services/wastl-data.service";
import { ToastMessageProvider } from "../common/toast-message-provider";
import { AboutModal } from "../pages/overview/about.modal";
import { SettingsModal } from "../pages/overview/settings.modal";
import { IonicStorageModule } from "@ionic/storage";
import { StorageService } from "../services/storage.service";
import { BrowserModule } from "@angular/platform-browser";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { HttpModule } from "@angular/http";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Clipboard } from "@ionic-native/clipboard";
import { EasterEggPopover } from "../pages/overview/easteregg.popover";
import { GeoService } from "../services/geo.service";
import { Geolocation } from "@ionic-native/geolocation";
import { MapService } from "../services/map.service";

@NgModule({
	declarations: [
		GrisuApp,
		OverviewPage,
		DistrictsPage,
		StatisticsPage,
		WaterPage,
		TabsPage,
		GrisuRefresherContentComponent,
		AboutModal,
		SettingsModal,
		EasterEggPopover
	],
	imports: [
		BrowserModule,
		HttpModule,
		IonicStorageModule.forRoot(),
		IonicModule.forRoot(GrisuApp)
	],
	bootstrap: [IonicApp],
	entryComponents: [
		GrisuApp,
		OverviewPage,
		DistrictsPage,
		StatisticsPage,
		WaterPage,
		TabsPage,
		AboutModal,
		SettingsModal,
		EasterEggPopover
	],
	providers: [
		StatusBar,
		SplashScreen,
		InAppBrowser,
		Clipboard,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		WastlDataService,
		ToastMessageProvider,
		StorageService,
		GeoService,
		MapService,
		Geolocation
	]
})
export class AppModule {
}
