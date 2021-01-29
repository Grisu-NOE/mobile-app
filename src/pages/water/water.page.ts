import { Component, OnInit, ElementRef } from "@angular/core";
import { GeoService } from "../../services/geo.service";
import { LatLng, Map, Layer } from "leaflet";
import { Geolocation } from "@ionic-native/geolocation";
import { ToastMessageProvider } from "../../common/toast-message-provider";
import { MapService } from "../../services/map.service";

@Component({
	selector: "page-water",
	templateUrl: "water.html"
})
export class WaterPage implements OnInit {

	private layers: Layer[] = [];
	private map: Map;
	private lastPosition: LatLng = MapService.DEFAULT_LAT_LNG;

	constructor(
		private geoService: GeoService,
		private elementReference: ElementRef,
		private geolocation: Geolocation,
		private messageProvider: ToastMessageProvider,
		private mapService: MapService) { }

	public ngOnInit(): void {
		this.map = this.mapService.createStandardMap(this.elementReference.nativeElement.querySelector(".map"), true);
		this.map.on("click", (event: L.MouseEvent) => this.handlePositionChange(event.latlng));
		this.locate();
	}

	/**
	 * Re-center map after view changes
	 */
	public ionViewDidEnter(): void {
		if (MapService.DEFAULT_LAT_LNG.equals(this.lastPosition)) {
			return;
		}
		this.handlePositionChange(this.lastPosition);
	}

	private locate(): void {
		this.geolocation.getCurrentPosition().then(position => {
			this.handlePositionChange(new LatLng(position.coords.latitude, position.coords.longitude));
		}).catch(error => {
			this.messageProvider.showNotification("Konnte aktuelle Position nicht automatisch bestimmen. Bitte gewünschte Position manuell wählen.");
			this.handlePositionChange(MapService.DEFAULT_LAT_LNG);
		});
	}

	private addMarker(): void {
		let marker = this.mapService.createStandardMarker(this.map.getCenter());
		this.map.addLayer(marker);
		this.layers.push(marker);
	}

	private addCircles(): void {
		for (let circle of this.mapService.createCirclesForPosition(this.map.getCenter())) {
			circle.addTo(this.map);
			this.layers.push(circle);
		}
	}

	private addWastlHydrants(): void {
		const latitude = this.map.getCenter().lat.toString();
		const longitude = this.map.getCenter().lng.toString();

		this.geoService.findWastlHydrantsForPosition(latitude, longitude).subscribe(data => {
			for (let hydrant of data) {
				let marker = this.mapService.createWastlHydrantMarker(hydrant);
				this.map.addLayer(marker);
				this.layers.push(marker);
			}
		}, error => this.messageProvider.showNotification("In der Umgebung gelegene WASTL-Wasserentnahmestellen konnten nicht geladen werden."));
	}

	private removeLayers(): void {
		for (let layer of this.layers) {
			this.map.removeLayer(layer);
		}
		this.layers = [];
	}

	private updateLayersAndHydrants(): void {
		this.removeLayers();

		this.addMarker();
		this.addCircles();
		this.addWastlHydrants();
	};

	private handlePositionChange(newPosition: LatLng): void {
		if (this.map.getCenter().equals(newPosition)) {
			return;
		}
		this.map.once("moveend", () => this.updateLayersAndHydrants());
		this.map.panTo(newPosition);
		this.lastPosition = newPosition;
	}

	public showHelp(): void {
		console.log("show help");
		// TODO
	}

	public takeScreenshot(): void {
		console.log("screenshot");
		// TODO
	}
}
