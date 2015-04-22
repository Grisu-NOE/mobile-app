angular.module('grisu-noe').controller('statisticsTabController',
    function(util, dataService, $scope, $timeout, $ionicScrollDelegate) {

    $scope.tabs = [
        { isActive: true },
        { isActive: false },
        { isActive: false }
    ];

    var chartInstances = [];

    $scope.doRefresh = function(loadFromCache) {
        util.genericRefresh($scope, dataService.getMainData(loadFromCache), function(data) {
            $scope.mainData = data;
            $scope.createCharts(data);
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

            // hack to render chart correctly
            $timeout(function() {
                $scope.createCharts($scope.mainData);
            }, 1);
        }
    };

    $scope.createCharts = function(data) {
        var chartData = [
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

        function createArray(key) {
            var result = [];
            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i].hasOwnProperty(key)) {
                    result.push(chartData[i][key]);
                }
            }
            return result;
        }

        function populateData(key, historyData) {
            angular.forEach(historyData, function(entry) {
                for (var i = 0; i < chartData.length; i++) {
                    if (chartData[i].key == entry.a) {
                        chartData[i][key] += entry.s;
                    }
                }
            });
        }

        function isElementHidden(element) {
            return (element.offsetParent === null);
        }

        function tryBuildBarChart(cssId, matrixKey) {
            var element = document.getElementById(cssId);
            if (isElementHidden(element)) {
                return null;
            }

            var data = {
                labels: createArray('key'),
                datasets: [{
                    fillColor: 'rgba(220,220,220,0.5)',
                    strokeColor: 'white',
                    highlightFill: 'rgba(220,220,220,0.75)',
                    highlightStroke: 'white',
                    data: createArray(matrixKey)
                }]
            };

            var ctx = element.getContext('2d');
            var barChart = new Chart(ctx).Bar(data, {
                responsive: true,
                scaleGridLineColor : 'rgba(255,255,255,.09)',
                animation: false
            });

            // hack to specify different colors for bars of a dataset
            for (var i = 0; i < 10; i++) {
                var color;
                var highlightColor;

                if (i < 3) {
                    color = '#4a87ee';
                    highlightColor = '#4a99ee';
                } else if (i < 7) {
                    color = '#ef4e3a';
                    highlightColor = '#ed6657';
                } else {
                    color = '#66cc33';
                    highlightColor = '#80e050';
                }

                barChart.datasets[0].bars[i].fillColor = color;
                barChart.datasets[0].bars[i].highlightFill = highlightColor;
            }

            barChart.update();

            return barChart;
        }

        function tryBuildPieChart(cssId, matrixKey) {
            var element = document.getElementById(cssId);
            if (isElementHidden(element)) {
                return null;
            }

            var t = 0;
            var b = 0;
            var s = 0;

            for (var i = 0; i < chartData.length; i++) {
                if (chartData[i].key.substr(0, 1) == 'T') {
                    t += chartData[i][matrixKey];
                } else if (chartData[i].key.substr(0, 1) == 'B') {
                    b += chartData[i][matrixKey];
                } else {
                    s += chartData[i][matrixKey];
                }
            }

            var data = [{
                value: t,
                color: '#4a87ee',
                highlight: '#4a99ee',
                label: 'T'
            }, {
                value: b,
                color: '#ef4e3a',
                highlight: '#ed6657',
                label: 'B'
            }, {
                value: s,
                color: '#66cc33',
                highlight: '#80e050',
                label: 'S'
            }];

            var ctx = element.getContext('2d');
            return new Chart(ctx).Pie(data, {
                responsive: true,
                // android is too slow for animation ;(
                animation: false
            });
        }

        populateData('c1', data.h1.v);
        populateData('c2', data.h2.v);
        populateData('c3', data.h3.v);

        // cleanup of existing instances to prevent memory leaks
        angular.forEach(chartInstances, function(instance) {
            if (instance !== null) {
                instance.destroy();
            }
        });
        chartInstances = [];

        chartInstances.push(tryBuildBarChart('barchart1', 'c1'));
        chartInstances.push(tryBuildPieChart('piechart1', 'c1'));
        chartInstances.push(tryBuildBarChart('barchart2', 'c2'));
        chartInstances.push(tryBuildPieChart('piechart2', 'c2'));
        chartInstances.push(tryBuildBarChart('barchart3', 'c3'));
        chartInstances.push(tryBuildPieChart('piechart3', 'c3'));
    };
});