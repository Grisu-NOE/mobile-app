import { Component, ElementRef, OnInit } from "@angular/core";
import { Chart, LinearChartData, LinearTickOptions } from "chart.js";
import { Refresher, Gesture } from "ionic-angular";
import { WastlDataService } from "../../services/wastl-data.service";
import { HistoryEntry, AlarmType } from "../../common/models";
import { ToastMessageProvider } from "../../common/toast-message-provider";
import "rxjs/add/operator/finally";

@Component({
	selector: "page-statistics",
	templateUrl: "statistics.html"
})
export class StatisticsPage implements OnInit {

	private selectedTimeSpan: string = "now";
	private barChart: Chart;
	private pieChart: Chart;
	private historyEntries: Array<HistoryEntry> = new Array();
	private historyCount: number = 0;

	constructor(
		private elementReference: ElementRef,
		private dataService: WastlDataService,
		private messageProvider: ToastMessageProvider) {}

	public ngOnInit(): void {
		this.initBarChart(".bar-chart");
		this.initPieChart(".pie-chart");
	}

	public ionViewWillEnter(): void {
		this.doRefresh();
	}

	private doRefresh(refresher?: Refresher): void {
		this.dataService.findMainData()
			.finally(() => {
				if (refresher != null) {
					refresher.complete();
				}
			})
			.subscribe(data => {
				if (this.selectedTimeSpan == "now") {
					this.historyEntries = data.currentHistory;
				} else if (this.selectedTimeSpan == "12h") {
					this.historyEntries = data.history12h;
				} else if (this.selectedTimeSpan == "24h") {
					this.historyEntries = data.history24h;
				} else {
					throw new Error("Selected timespan does not exist.");
				}

				this.historyCount = this.historyEntries.map(entry => entry.count).reduce((prev, curr) => prev + curr);

				this.updateBarChart();
				this.updatePieChart();
			}, error => this.messageProvider.showHttpError(error));
	}

	private updatePieChart(): void {
		let chartData: Array<number> = [0, 0, 0];

		this.historyEntries.forEach(entry => {
			if (entry.type.value.startsWith("T")) {
				chartData[0] += entry.count;
			} else if (entry.type.value.startsWith("B")) {
				chartData[1] += entry.count;
			} else if (entry.type.value.startsWith("S")) {
				chartData[2] += entry.count;
			} else {
				throw new Error("Invalid alarm type");
			}
		});

		(<LinearChartData>this.pieChart.data).datasets[0].data = chartData;
		this.pieChart.update();
	}

	private updateBarChart(): void {
		let chartData: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		this.historyEntries.forEach(entry => {
			switch (entry.type) {
				case AlarmType.T1:
					chartData[0] += entry.count;
					break;
				case AlarmType.T2:
					chartData[1] += entry.count;
					break;
				case AlarmType.T3:
					chartData[2] += entry.count;
					break;
				case AlarmType.B1:
					chartData[3] += entry.count;
					break;
				case AlarmType.B2:
					chartData[4] += entry.count;
					break;
				case AlarmType.B3:
					chartData[5] += entry.count;
					break;
				case AlarmType.B4:
					chartData[6] += entry.count;
					break;
				case AlarmType.S1:
					chartData[7] += entry.count;
					break;
				case AlarmType.S2:
					chartData[8] += entry.count;
					break;
				case AlarmType.S3:
					chartData[9] += entry.count;
				default:
					throw new Error("AlarmType not found");
			}
		});

		(<LinearChartData>this.barChart.data).datasets[0].data = chartData;
		this.barChart.update();
	}

	private initPieChart(selector: string): void {
		if (this.pieChart != null) {
			throw new Error("Pie chart is already initialized");
		}

		this.pieChart = new Chart(this.elementReference.nativeElement.querySelector(selector), {
			type: "pie",
			data: {
				labels: ["Technisch", "Brand", "Schadstoff"],
				datasets: [{
					backgroundColor: [
						"#387ef5",
						"#ef4e3a",
						"#32db64"
					],
					borderColor: "white",
					borderWidth: 2
				}]
			},
			options: {
				legend: {
					display: false
				}
			}
		});
	}

	private initBarChart(selector: string): void {
		if (this.barChart != null) {
			throw new Error("Bar chart is already initialized");
		}

		this.barChart = new Chart(this.elementReference.nativeElement.querySelector(selector), {
			type: "bar",
			data: {
				labels: AlarmType.all().map(type => type.value),
				datasets: [{
					backgroundColor: [
						"#387ef5",
						"#387ef5",
						"#387ef5",
						"#ef4e3a",
						"#ef4e3a",
						"#ef4e3a",
						"#ef4e3a",
						"#32db64",
						"#32db64",
						"#32db64"
					],
					borderColor: "white",
					borderWidth: 2
				}]
			},
			options: {
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						gridLines: {
							color: "#444"
						}
					}],
					yAxes: [{
						ticks: <LinearTickOptions>{
							beginAtZero: true,
							callback: val => {
								// only integers, no floating point numbers
								if (val % 1 == 0) {
									return val;
								}
							}
						},
						gridLines: {
							color: "#444"
						}
					}]
				}
			}
		});
	}

	public swipeLeft(event: Gesture): void {
		if (this.selectedTimeSpan == "24h") {
			this.selectedTimeSpan = "12h";
		} else if (this.selectedTimeSpan == "12h") {
			this.selectedTimeSpan = "now";
		} else {
			this.selectedTimeSpan = "24h"
		}
		this.doRefresh();
	}

	public swipeRight(event: Gesture): void {
		if (this.selectedTimeSpan == "now") {
			this.selectedTimeSpan = "12h";
		} else if (this.selectedTimeSpan == "12h") {
			this.selectedTimeSpan = "24h";
		} else {
			this.selectedTimeSpan = "now"
		}
		this.doRefresh();
	}
}
