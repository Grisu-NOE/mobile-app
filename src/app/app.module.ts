import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { GrisuApp } from './app.component';

import { OverviewPage } from '../pages/overview/overview';
import { TabsPage } from '../pages/tabs/tabs';

@NgModule({
	declarations: [
		GrisuApp,
		OverviewPage,
		TabsPage
	],
	imports: [
		IonicModule.forRoot(GrisuApp)
	],
	bootstrap: [IonicApp],
	entryComponents: [
		GrisuApp,
		OverviewPage,
		TabsPage
	],
	providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }]
})
export class AppModule { }
