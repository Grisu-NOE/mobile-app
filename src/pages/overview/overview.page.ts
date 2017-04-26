import { Component, ElementRef, OnInit } from "@angular/core";
import { Refresher, Platform, ModalController } from "ionic-angular";
import { WastlDataService } from "../../services/wastl-data.service";
import { MainData, WarnState } from "../../common/models";
import { ToastMessageProvider } from "../../common/toast-message-provider";
import { AboutModal } from "./about.modal";
import { SettingsModal } from "./settings.modal";
import "rxjs/add/operator/finally";

@Component({
	selector: "page-overview",
	templateUrl: "overview.html"
})
export class OverviewPage implements OnInit {

	private data: MainData;
	private mapElement: SVGElement;

	constructor(private dataService: WastlDataService,
		private messageProvider: ToastMessageProvider,
		private modalController: ModalController,
		private elementReference: ElementRef,
		platform: Platform) {

		platform.resume.subscribe(this.doRefresh());
	}

	private doRefresh(refresher?: Refresher): void {
		this.dataService.findMainData()
			.finally(() => {
				if (refresher != null) {
					refresher.complete();
				}
			})
			.subscribe(data => {
				this.data = data;
				this.updateMap();
			}, error => this.messageProvider.showHttpError(error));
	}

	public ngOnInit(): void {
		this.mapElement = this.elementReference.nativeElement.querySelector(".lower-austria-map");
	}

	public ionViewWillEnter(): void {
		this.doRefresh();
	}

	public mapTap(districtElement: SVGPathElement): void {
		districtElement.classList.toString();
		// TODO
		console.log(districtElement.classList.toString());
	}

	public showAbout(): void {
		this.modalController.create(AboutModal).present();
	}

	public showSettings(): void {
		this.modalController.create(SettingsModal, { districts: this.data.districts }).present();
	}

	private updateMap(): void {
		let allPaths: NodeListOf<SVGPathElement> = this.mapElement.getElementsByTagName("path");

		// cleanup of css classes
		for (let i = 0; i < allPaths.length; i++) {
			let path: SVGElement = allPaths.item(i);

			for (let warnState of WarnState.all()) {
				path.classList.remove(warnState.value);
			}
		}

		// add new classes to colorize map
		for (let district of this.data.districts) {
			let districtPaths: NodeListOf<Element> = this.mapElement.getElementsByClassName(district.identifier);

			for (let i = 0; i < districtPaths.length; i++) {
				let path: Element = districtPaths.item(i);
				path.classList.add(district.warnState.value);
			}
		}
	}
}
