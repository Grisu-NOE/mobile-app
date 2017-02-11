import {Component} from "@angular/core";
import {Refresher, Platform} from "ionic-angular";
import {WastlDataService} from "../../services/wastl-data.service";
import {MainData, WarnState} from "../../common/models";
import {ToastMessageProvider} from "../../common/toast-message-provider";

@Component({
	selector: "page-overview",
	templateUrl: "overview.html"
})
export class OverviewPage {

	private data: MainData;

	constructor(private dataService: WastlDataService, private messageProvider: ToastMessageProvider, platform: Platform) {
		platform.resume.subscribe(this.doRefresh);
	}

	private doRefresh(refresher?: Refresher): void {
		this.dataService.findMainData().subscribe(data => {
			this.data = data;
			this.updateMap();
		}, this.messageProvider.showHttpError, () => {
			if (refresher != null) {
				refresher.complete()
			}
		});
	}

	private ionViewWillEnter(): void {
		this.doRefresh();
	}

	private mapTap(districtElement: SVGPathElement): void {
		districtElement.classList.toString()
		// TODO
		console.log(districtElement.classList.toString());
	}

	private updateMap(): void {
		let svg: SVGElement = <SVGElement> document.getElementsByClassName("lower-austria-map")[0];
		let allPaths: NodeListOf<SVGPathElement> = svg.getElementsByTagName("path");

		// cleanup of css classes
		for (let i = 0; i < allPaths.length; i++) {
			let path: SVGElement = allPaths.item(i);

			for (let warnState of WarnState.all()) {
				path.classList.remove(warnState.value);
			}
		}

		// add new classes to colorize map
		for (let district of this.data.districts) {
			let districtPaths: NodeListOf<Element> = svg.getElementsByClassName(district.identifier);

			for (let i = 0; i < districtPaths.length; i++) {
				let path: Element = districtPaths.item(i);
				path.classList.add(district.warnState.value);
			}
		}
	}
}
