import { Component } from '@angular/core';

import { OverviewPage } from '../overview/overview';
import { DistrictsPage } from '../districts/districts';
import { StatisticsPage } from '../statistics/statistics';
import { WaterPage } from '../water/water';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {
	overviewTab = OverviewPage;
	districtsTab = DistrictsPage;
	statisticsTab = StatisticsPage;
	waterTab = WaterPage;

	constructor() {

	}
}
