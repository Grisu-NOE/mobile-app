import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { GrisuApp } from './app.component';

import { OverviewPage } from '../pages/overview/overview';
import { DistrictsPage } from '../pages/districts/districts';
import { StatisticsPage } from '../pages/statistics/statistics';
import { WaterPage } from '../pages/water/water';
import { TabsPage } from '../pages/tabs/tabs';

@NgModule({
	declarations: [
		GrisuApp,
		OverviewPage,
		DistrictsPage,
		StatisticsPage,
		WaterPage,
		TabsPage
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
	providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
