import { Injectable } from "@angular/core";
import { MapCircle, WastlHydrant, WastlHydrantType } from "../common/models";
import { Control, DomUtil, TileLayer, Map, Circle, LatLng, Marker, Icon } from "leaflet";

@Injectable()
export class MapService {

	private static readonly BASEMAP_LAYER = new TileLayer("http://maps{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
		subdomains: ["", "1", "2", "3", "4"]
	});
	private static readonly OSM_LAYER = new TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	private static readonly HYBRID_LAYER = new TileLayer("http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
		subdomains: ["mt0", "mt1", "mt2", "mt3"]
	});
	private static readonly TERRAIN_LAYER = new TileLayer("http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
		subdomains: ["mt0", "mt1", "mt2", "mt3"]
	});

	private static readonly OFM_OVERLAY = new TileLayer("http://openfiremap.org/hytiles/{z}/{x}/{y}.png");

	/* Defaults to Wolfsgraben */
	public static readonly DEFAULT_LAT_LNG = new LatLng(48.16387421351802, 16.12121343612671);

	public createStandardMap(element: HTMLElement, overlaysActive?: boolean): Map {
		let map = new Map(element, {
			center: MapService.DEFAULT_LAT_LNG,
			zoom: 15,
			layers: [MapService.BASEMAP_LAYER]
		});

		const overlays = this.getOverlaysAsObject();

		if (overlaysActive) {
			for (let key in overlays) {
				map.addLayer(overlays[key]);
			}
		}

		new Control.Layers(this.getTileLayersAsObject(), this.getOverlaysAsObject()).addTo(map);
		new Control.Scale({ maxWidth: 100 }).addTo(map);
		this.addDistanceLegendToMap(map);

		return map;
	}

	private getTileLayersAsObject(): Control.LayersObject {
		return {
			"basemap.at": MapService.BASEMAP_LAYER,
			"OpenStreetMap": MapService.OSM_LAYER,
			"Satellit": MapService.HYBRID_LAYER,
			"Gel&auml;nde": MapService.TERRAIN_LAYER
		};
	}

	private getOverlaysAsObject(): Control.LayersObject {
		return {
			"OpenFireMap": MapService.OFM_OVERLAY
		};
	}

	private addDistanceLegendToMap(map: Map): void {
		let legend = new Control({ position: "bottomright" });

		legend.onAdd = () => {
			let div = DomUtil.create("div", "legend");

			for (let circle of this.getMapCircles()) {
				div.innerHTML += '<i style="background: ' + circle.color + '"></i> ' + circle.radius + ' m<br>';
			}

			return div;
		};

		legend.addTo(map);
	}

	private createCircle(circleModel: MapCircle, position: LatLng): Circle {
		return new Circle(position, circleModel.radius, {
			fillColor: circleModel.color,
			color: circleModel.color,
			weight: 2,
			opacity: 1,
			fillOpacity: 0.15
		});
	}

	private getMapCircles(): MapCircle[] {
		return [
			{ radius: 50, color: "#43cee6" },
			{ radius: 100, color: "#66cc33" },
			{ radius: 150, color: "#f0b840" },
			{ radius: 300, color: "#ef4e3a" }
		];
	}

	public createCirclesForPosition(position: LatLng): Circle[] {
		let circles: Circle[] = [];

		for (let circleModel of this.getMapCircles()) {
			circles.push(this.createCircle(circleModel, position));
		}

		return circles;
	}

	public createStandardMarker(position: LatLng): Marker {
		return new Marker(position, {
			icon: new Icon({
				iconUrl: "assets/pin.png",
				iconRetinaUrl: "assets/pin-2x.png",
				iconSize: [26, 40],
				iconAnchor: [13, 40],
				shadowUrl: "build/images/marker-shadow.png",
				shadowSize: [41, 41]
			})
		});
	}

	public createWastlHydrantMarker(hydrant: WastlHydrant): Marker {
		let icon: Icon;

		switch (hydrant.type) {
			case WastlHydrantType.BA:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/ba.png",
					iconSize: [32, 32],
					iconAnchor: [16, 16],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.BRUNNEN:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/brunnen.png",
					iconSize: [24, 24],
					iconAnchor: [12, 12],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.LT:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/lt.png",
					iconSize: [32, 19],
					iconAnchor: [16, 9],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.LWBH:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/lwbh.png",
					iconSize: [32, 19],
					iconAnchor: [16, 9],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.PU:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/pu.png",
					iconSize: [24, 24],
					iconAnchor: [12, 12],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.SL:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/sl.png",
					iconSize: [26, 26],
					iconAnchor: [13, 13],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.SS:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/ss.png",
					iconSize: [26, 26],
					iconAnchor: [13, 13],
					popupAnchor: [0, 0]
				});
				break;
			case WastlHydrantType.UF:
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/uf.png",
					iconSize: [18, 32],
					iconAnchor: [9, 32],
					popupAnchor: [0, -32]
				});
				break;
			default: // OF
				icon = new Icon({
					iconUrl: "assets/wastl-hydrants/of.png",
					iconSize: [18, 32],
					iconAnchor: [9, 32],
					popupAnchor: [0, -32]
				});
		}

		let marker = new Marker(new LatLng(hydrant.latitude, hydrant.longitude), {
			icon: icon
		});

		marker.bindPopup(
			"Objekttyp: " + hydrant.type.translation + "<br>" +
			"Distanz: " + hydrant.distance + "m<br>" +
			"Kennung: " + hydrant.id + "<br>" +
			"Standort: " + hydrant.address + "<br>" +
			"Bemerkung: " + hydrant.description + "<br>"
		);

		return marker;
	}
}
