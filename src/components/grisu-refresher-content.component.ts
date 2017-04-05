import { Component } from "@angular/core";

/**
 * FIXME: Introduce an own refresher component (not only the content) when https://github.com/driftyco/ionic/issues/10540 gets resolved.
 */
@Component({
	selector: "grisu-refresher-content",
	template: `<ion-refresher-content pullingText="Aktualisieren" refreshingText="Lade Daten..."></ion-refresher-content>`
})
export class GrisuRefresherContentComponent {
}
