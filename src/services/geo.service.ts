import { Injectable } from "@angular/core";
import { AbstractHttpService } from "./abstract-http.service";
import { Http } from "@angular/http";
import { MapCircle } from "../common/models";
import { Control, DomUtil, TileLayer, Map, Circle, LatLng } from "leaflet";

@Injectable()
export class GeoService extends AbstractHttpService {

	public static readonly BASEMAP_LAYER = new TileLayer("http://maps{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
		subdomains: ['', '1', '2', '3', '4']
	});
	public static readonly OSM_LAYER = new TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
	public static readonly HYBRID_LAYER = new TileLayer("http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
		subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
	});
	public static readonly TERRAIN_LAYER = new TileLayer("http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
		subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
	});

	constructor(http: Http) {
		super(http);
	}

	public getTileLayersAsObject(): Control.LayersObject {
		return {
			"basemap.at": GeoService.BASEMAP_LAYER,
			"OpenStreetMap": GeoService.OSM_LAYER,
			"Satellit": GeoService.HYBRID_LAYER,
			"Gel&auml;nde": GeoService.TERRAIN_LAYER
		};
	}

	public addDistanceLegendToMap(map: Map): void {
		let legend = new Control({ position: 'bottomright' });

		legend.onAdd = () => {
			let div = DomUtil.create('div', 'legend');

			for (let circle of this.getMapCircles()) {
				div.innerHTML += '<i style="background:' + circle.color + '"></i> ' + circle.radius + ' m<br>';
			}

			return div;
		};

		legend.addTo(map);
	}

	public createCircle(circleModel: MapCircle, position: LatLng) {
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
			{ radius: 50, color: '#43cee6' },
			{ radius: 100, color: '#66cc33' },
			{ radius: 150, color: '#f0b840' },
			{ radius: 300, color: '#ef4e3a' }
		];
	}
}
