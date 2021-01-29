import {ToastController} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class ToastMessageProvider {

	private static readonly DEFAULT_DURATION = 3000;

	constructor(private toastController: ToastController) {
	}

	public showHttpError(details: string): void {
		this.showNotification("Daten konnten nicht geladen werden. Fehlerdetails: " + details);
	}

	public showNotification(message: string, position?: string): void {
		this.toastController.create({
			message: message,
			duration: ToastMessageProvider.DEFAULT_DURATION,
			position: position != null ? position : "middle"
		}).present();
	}
}
