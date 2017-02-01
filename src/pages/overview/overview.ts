import {Component} from '@angular/core';

import {NavController, Refresher} from 'ionic-angular';

@Component({
	selector: 'page-overview',
	templateUrl: 'overview.html'
})
export class OverviewPage {

	constructor(public navCtrl: NavController) {

	}

	doRefresh(refresher: Refresher) {
		console.log('Begin async operation', refresher);

		setTimeout(() => {
			console.log('Async operation has ended');
			refresher.complete();
		}, 2000);
	}

	mapTap(districtElement: SVGPathElement) {
		districtElement.classList.toString()
		//let pathElement: SVGPathElement = event.currentTarget;
		console.log(districtElement.classList.toString());
	}
}
