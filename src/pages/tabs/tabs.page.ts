import {Component} from "@angular/core";

import {OverviewPage} from "../overview/overview.page";
import {DistrictsPage} from "../districts/districts.page";
import {StatisticsPage} from "../statistics/statistics.page";
import {WaterPage} from "../water/water.page";

@Component({
	templateUrl: "tabs.html"
})
export class TabsPage {
	overviewTab = OverviewPage;
	districtsTab = DistrictsPage;
	statisticsTab = StatisticsPage;
	waterTab = WaterPage;
}
