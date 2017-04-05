import {ToastController} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class ToastMessageProvider {

	private static readonly DEFAULT_DURATION = 3000;

	constructor(private toastController: ToastController) {
	}

	public showHttpError(errorMessage: string): void {
		this.showError("Daten konnten nicht geladen werden. Fehlerdetails: " + errorMessage);
	}

	public showError(errorMessage: string): void {
		this.toastController.create({
			message: errorMessage,
			duration: ToastMessageProvider.DEFAULT_DURATION,
			position: "middle"
		}).present();
	}
}
