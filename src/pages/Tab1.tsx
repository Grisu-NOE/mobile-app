import {
	IonButton, IonButtons,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonIcon,
	IonItem,
	IonList,
	IonPage,
	IonRow,
	IonTitle,
	IonToolbar
} from '@ionic/react';
import {star, informationCircle, mail, settings} from 'ionicons/icons';
import React from 'react';
import './Tab1.css';
import LowerAustriaMap from "../components/LowerAustriaMap";

const Tab1: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton>
							<IonIcon slot="icon-only" icon={informationCircle}/>
						</IonButton>
					</IonButtons>
					<IonTitle>Grisu NÖ</IonTitle>
					<IonButtons slot="end">
						<IonButton>
							<IonIcon slot="icon-only" icon={mail}/>
						</IonButton>
						<IonButton>
							<IonIcon slot="icon-only" icon={settings}/>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonGrid>
					<IonRow>
						<IonCol size-md align-self-center>
							<IonList inset>
								<IonItem no-padding>Aktuelle Einsätze: 1</IonItem>
								<IonItem no-padding>Ausgerückte Feuerwehren: 2</IonItem>
								<IonItem no-padding>Aktive Bezirke: 3</IonItem>
							</IonList>

							<IonButton expand="full" color="dark">
								<IonIcon slot="start" icon={star}/>
								Meine Einsatzhistorie
							</IonButton>
						</IonCol>
						<IonCol size-md align-self-center>
							<LowerAustriaMap onClick={district => console.log(district)}/>
						</IonCol>
					</IonRow>
				</IonGrid>
			</IonContent>
		</IonPage>
	);
};

export default Tab1;
