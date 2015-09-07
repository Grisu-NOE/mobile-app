angular.module('grisu-noe').controller('statisticsTabController',
    function(util, dataService, $scope, $ionicScrollDelegate) {

    $scope.tabs = [
        { isActive: true },
        { isActive: false },
        { isActive: false }
    ];

    $scope.chartOptions = {
        responsive: true,
        scaleGridLineColor: 'rgba(255,255,255,.09)',
        animation: false
    };

    $scope.pieChartLabels = ['T', 'B', 'S'];
    $scope.pieChartColors = ['#4a87ee', '#ef4e3a', '#66cc33'];

    var chartData = [];
    var initChartData = function() {
        chartData = [
            { key: 'T1', c1: 0, c2: 0, c3: 0},
            { key: 'T2', c1: 0, c2: 0, c3: 0},
            { key: 'T3', c1: 0, c2: 0, c3: 0},
            { key: 'B1', c1: 0, c2: 0, c3: 0},
            { key: 'B2', c1: 0, c2: 0, c3: 0},
            { key: 'B3', c1: 0, c2: 0, c3: 0},
            { key: 'B4', c1: 0, c2: 0, c3: 0},
            { key: 'S1', c1: 0, c2: 0, c3: 0},
            { key: 'S2', c1: 0, c2: 0, c3: 0},
            { key: 'S3', c1: 0, c2: 0, c3: 0}
        ];
    };

    var createArray = function(key) {
        var result = [];
        for (var i = 0; i < chartData.length; i++) {
            if (chartData[i].hasOwnProperty(key)) {
                result.push(chartData[i][key]);
            }
        }
        return result;
    };

    var populateData = function(key, historyData) {
        angular.forEach(historyData, function(entry) {
            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i].key == entry.a) {
                    chartData[i][key] += entry.s;
                }
            }
        });
    };

    var computeChartData = function() {
        initChartData();
        $scope.barChartLabels = createArray('key');

        populateData('c1', $scope.mainData.h1.v);
        populateData('c2', $scope.mainData.h2.v);
        populateData('c3', $scope.mainData.h3.v);

        $scope.chartDataBar1 = [ createArray('c1') ];
        $scope.chartDataBar2 = [ createArray('c2') ];
        $scope.chartDataBar3 = [ createArray('c3') ];

        $scope.chartDataPie1 = sumPieChartData('c1');
        $scope.chartDataPie2 = sumPieChartData('c2');
        $scope.chartDataPie3 = sumPieChartData('c3');
    };

    var sumPieChartData = function(matrixKey) {
        var result = [0, 0, 0];

        for (var i = 0; i < chartData.length; i++) {
            switch (chartData[i].key.substr(0, 1)) {
                case 'T':
                    result[0] += chartData[i][matrixKey];
                    break;
                case 'B':
                    result[1] += chartData[i][matrixKey];
                    break;
                default: // S
                    result[2] += chartData[i][matrixKey];
                    break;
            }
        }

        return result;
    };

    var colorBarChart = function(chart) {
        for (var i = 0; i < chartData.length; i++) {
            var color;
            var highlightColor;
            var firstChar = chartData[i].key.substr(0, 1);

            switch (firstChar) {
                case 'T':
                    color = '#4a87ee';
                    highlightColor = '#4a99ee';
                    break;
                case 'B':
                    color = '#ef4e3a';
                    highlightColor = '#ed6657';
                    break;
                default: // S
                    color = '#66cc33';
                    highlightColor = '#80e050';
                    break;
            }

            chart.datasets[0].bars[i].fillColor = color;
            chart.datasets[0].bars[i].highlightFill = highlightColor;
            chart.datasets[0].bars[i].strokeColor = 'white';
            chart.datasets[0].bars[i].highlightStroke = 'white';

            chart.update();
        }
    };

    var colorPieChart = function(chart) {
        angular.forEach(chart.segments, function(segment, key) {
            switch (key) {
                case 0:
                    segment.highlightColor = '#4a99ee';
                    break;
                case 1:
                    segment.highlightColor = '#ed6657';
                    break;
                default: // S
                    segment.highlightColor = '#80e050';
                    break;
            }
        });

        chart.update();
    };

    $scope.$on('create', function(event, chart) {
        var element = chart.chart.canvas;

        if (element.className.indexOf('chart-bar') > -1) {
            colorBarChart(chart);
        } else {
            colorPieChart(chart);
        }
    });

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.mainData = data;
            computeChartData();
        });
    };

    $scope.$on('cordova.resume', function() {
        $scope.doRefresh(false);
    });

    $scope.$on('$ionicView.enter', function() {
        $scope.doRefresh(true);
    });

    $scope.setTabActive = function(tabNo) {
        var activeTab = -1;
        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].isActive) {
                activeTab = i;
                break;
            }
        }

        if (activeTab != -1 && tabNo != activeTab) {
            $scope.tabs[activeTab].isActive = false;
            $scope.tabs[tabNo].isActive = true;

            $ionicScrollDelegate.scrollTop(true);
        }
    };
});