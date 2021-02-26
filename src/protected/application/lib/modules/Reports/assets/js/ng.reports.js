(function (angular) {
    "use strict";
    var module = angular.module('ng.reports', []);
    
    module.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        $httpProvider.defaults.transformRequest = function (data) {
            var result = angular.isObject(data) && String(data) !== '[object File]' ? $.param(data) : data;

            return result;
        };
    }]);

    module.controller('Reports',['$scope', 'ReportsService','$window', function($scope, ReportsService, $window){
        
        $scope.data = {
            reportData: {},
            reportModal: false,
            graficType: true,
            graficData:false,            
            dataDisplay:[],
            estado: {
                'owner': '(Agente Responsável)',
                'instituicao': '(Agente Instituição relacionada)',
                'coletivo': '(Agente Coletivo)',
                'space': '(Espaço)'
            }
        };

        ReportsService.findDataOpportunity().success(function (data, status, headers){
            var dataOpportunity = angular.copy(data);

            $scope.data.dataDisplay =  dataOpportunity.map(function(index){
              
                if(index.label == "Estado"){
                    index.label = index.label+" " + $scope.data.estado[index.source.type];
                    return index;
                }else{
                    return index
                }                
            });

        })
        
        $scope.createGrafic = function() { 
            var index = $scope.data.reportData.dataDisplay;

            var reportData = {
                graficType: $scope.data.reportData.type,
                data: $scope.data.dataDisplay[index]
            };
            
            ReportsService.create({reportData: reportData}).success(function (data, status, headers){                
                $scope.graficGenerate(data);
            });
        }


        $scope.graficGenerate = function(reportData) {          

            var config = {
                type: reportData.typeGrafic,
                data: {
                    labels: reportData.labels,
                    datasets: [{
                        label: '# of Votes',
                        data: reportData.data,
                        backgroundColor: reportData.backgroundColor,
                        borderColor: reportData.backgroundColor,
                        borderWidth: false
                    }]
                },
                options: {
                    responsive: true,
                    legend: false,
                    plugins: {
                        datalabels: {     
                        display: function(context, ctx) {
                        },           
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
    
                            let percentage = (value*100 / sum).toFixed(2)+"%";
                            
                            return value + " "+"("+percentage+") \n\n";
                        },
                        anchor:"end",
                        align: "end",                        
                    
                    }
                }
                }
            };
    
           
            var ctx = document.getElementById("dinamic-grafic").getContext('2d');

            ctx.canvas.width = 1000;
            ctx.canvas.height = 300;
        
            if(MapasCulturais.Charts.charts["dinamic-grafic"]){
                MapasCulturais.Charts.charts["dinamic-grafic"].destroy();
            }
            MapasCulturais.Charts.charts["dinamic-grafic"] = new Chart(ctx, config);
            $scope.data.reportModal = false;
            $scope.data.graficData = false;
        }
       
    }]);
    
    module.factory('ReportsService', ['$http', '$rootScope', 'UrlService', function ($http, $rootScope, UrlService) {  
        return {  
            findDataOpportunity: function (data) {
               
                var url = MapasCulturais.createUrl('reports', 'dataOpportunityReport', {opportunity: MapasCulturais.entity.id});

                return $http.post(url, data).
                success(function (data, status, headers) {
                    $rootScope.$emit('registration.create', {message: "Reports found", data: data, status: status});
                }).
                error(function (data, status) {
                    $rootScope.$emit('error', {message: "Reports not found for this opportunity", data: data, status: status});
                });
            },          
            create: function (data) {
               
                var url = MapasCulturais.createUrl('reports', 'createGrafic', {opportunity: MapasCulturais.entity.id});

                return $http.post(url, data).
                success(function (data, status, headers) {
                    $rootScope.$emit('registration.create', {message: "Reports found", data: data, status: status});
                }).
                error(function (data, status) {
                    $rootScope.$emit('error', {message: "Reports not found for this opportunity", data: data, status: status});
                });
            }
        };
    }]);

})(angular);


function openDropdown(dropId) {
    if ($("#drop-" + dropId.name).hasClass('active')) {
        $("#drop-" + dropId.name).removeClass('active');
    } else {
        $(".dropdown-content.active").removeClass('active');
        $("#drop-" + dropId.name).addClass('active');
    }
}