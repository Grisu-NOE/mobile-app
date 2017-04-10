import { Component, OnInit, ElementRef } from "@angular/core";
import { GeoService } from "../../services/geo.service";
import { LatLng, Control, Map, Layer, Marker, Circle } from "leaflet";
import { Geolocation } from "@ionic-native/geolocation";
import { ToastMessageProvider } from "../../common/toast-message-provider";
import { MapCircle } from "../../common/models";

@Component({
	selector: "page-water",
	templateUrl: "water.html"
})
export class WaterPage implements OnInit {

	private layers: Layer[] = [];
	private circleModels: MapCircle[] = [];
	private circles: Circle[] = [];
	private map: Map;

	constructor(
		private geoService: GeoService,
		private elementReference: ElementRef,
		private geolocation: Geolocation,
		private messageProvider: ToastMessageProvider) { }

	public ngOnInit(): void {
		this.map = new Map(this.elementReference.nativeElement.querySelector(".map"), {
			center: new LatLng(48.16387421351802, 16.12121343612671),
			zoom: 15,
			layers: [GeoService.BASEMAP_LAYER]
		});

		new Control.Layers(this.geoService.getTileLayersAsObject()).addTo(this.map);
		new Control.Scale().addTo(this.map);

		this.geolocation.getCurrentPosition().then(position => {
			this.map.panTo(new LatLng(position.coords.latitude, position.coords.longitude));
			this.updateLayersAndHydrants();
		}).catch(error => {
			// Wolfsgraben
			this.map.panTo(new LatLng(48.16387421351802, 16.12121343612671));

			this.updateLayersAndHydrants();
			this.messageProvider.showNotification("Konnte aktuelle Position nicht automatisch bestimmen. Bitte gewünschte Position manuell wählen.");
		});
	}

	private removeLayers(): void {
		for (let layer of this.layers) {
			this.map.removeLayer(layer);
		}
		this.layers = [];
	};

	private addMarker(): void {
		// FIXME use normal red icon
		let marker = new Marker(this.map.getCenter(), {
			// icon: (L as any).AwesomeMarkers.icon({
			// 	icon: 'ion-radio',
			// 	markerColor: 'red',
			// 	iconColor: 'white'
			// })
		});

		this.map.addLayer(marker);
		this.layers.push(marker);
	};

	private addLayers(): void {
		this.removeLayers();
		this.addMarker();

		for (let circleModel of this.circleModels) {
			let circle = this.geoService.createCircle(circleModel, this.map.getCenter());
			circle.addTo(this.map);
			this.circles.push(circle);
		}
	};

	private updateLayersAndHydrants(): void {
		this.addLayers();

		// this.geoService.findHydrantsForPosition(this.map.getCenter()).then(data => {
		// 	// cleanup
		// 	for (let i = 0; i < this.hydrants.length; i++) {
		// 		this.map.removeLayer(this.hydrants[i]);
		// 	}
		// 	this.hydrants = [];

		// 	// add hydrants
		// 	geoService.addHydrantsToMap(data, map, hydrants);
		// }, function () {
		// 	if ($window.cordova) {
		// 		$cordovaToast.showShortBottom('In der Umgebung gelegene Wasserentnahmestellen konnten nicht geladen werden.');
		// 	}
		// }).finally(function () {
		// 	util.hideLoading();
		// });
	};

	public showHelp(): void {
		console.log("show help");
		// TODO
	}
}
