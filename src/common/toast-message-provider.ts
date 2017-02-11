import {ToastController} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class ToastMessageProvider {

	private static readonly DEFAULT_DURATION = 3000;

	constructor(private toastController: ToastController) {
	}

	public showHttpError(errorMessage: string): void {
		this.toastController.create({
			message: "Daten konnten nicht geladen werden. Fehlerdetails: " + errorMessage,
			duration: ToastMessageProvider.DEFAULT_DURATION,
			position: "middle"
		}).present();
	}
}
