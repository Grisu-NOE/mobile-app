import { Component } from "@angular/core";
import { MagicCookie } from "../../common/models";
import { ViewController } from "ionic-angular";
import { StorageService } from "../../services/storage.service";

@Component({
	selector: "easteregg-popover",
	templateUrl: "easteregg.html"
})
export class EasterEggPopover {

	private magicCookie: MagicCookie = { value: "", active: false };

	constructor(viewController: ViewController, storageService: StorageService) {
		storageService.findMagicCookie().then(magicCookie => {
			if (magicCookie == null) {
				console.debug("No magic cookie found in storage", magicCookie);
				return;
			}

			console.debug("Initialize magic cookie from storage", magicCookie);
			this.magicCookie = magicCookie;
		});

		viewController.onDidDismiss(() => {
			console.debug("Save magic cookie", this.magicCookie);
			storageService.saveMagicCookie(this.magicCookie);
		});
	}
}
