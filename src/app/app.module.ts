import {NgModule, ErrorHandler} from "@angular/core";
import {IonicApp, IonicModule, IonicErrorHandler} from "ionic-angular";
import {GrisuApp} from "./app.component";
import {OverviewPage} from "../pages/overview/overview.page";
import {DistrictsPage} from "../pages/districts/districts.page";
import {StatisticsPage} from "../pages/statistics/statistics.page";
import {WaterPage} from "../pages/water/water.page";
import {TabsPage} from "../pages/tabs/tabs.page";
import {GrisuRefresherContentComponent} from "../components/grisu-refresher-content.component";
import {WastlDataService} from "../services/wastl-data.service";
import {ToastMessageProvider} from "../common/toast-message-provider";

@NgModule({
	declarations: [
		GrisuApp,
		OverviewPage,
		DistrictsPage,
		StatisticsPage,
		WaterPage,
		TabsPage,
		GrisuRefresherContentComponent
	],
	imports: [
		IonicModule.forRoot(GrisuApp)
	],
	bootstrap: [IonicApp],
	entryComponents: [
		GrisuApp,
		OverviewPage,
		DistrictsPage,
		StatisticsPage,
		WaterPage,
		TabsPage
	],
	providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, WastlDataService, ToastMessageProvider]
})
export class AppModule {
}
