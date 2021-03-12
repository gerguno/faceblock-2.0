'use strict';

angular.module('app').controller('faceCtrl', function ($scope, faceStorage) {

    $scope.faceStorage = faceStorage;

    $scope.$watch('faceStorage.data', function() {
        $scope.faceList = $scope.faceStorage.data;
    });

    $scope.$watch('faceStorage.switcher', function() {
        $scope.switcher = $scope.faceStorage.switcher;
    });

    $scope.$watch('faceStorage.alert', function() {
        $scope.alert = $scope.faceStorage.alert;
    });    

    $scope.faceStorage.findAll(function(data){
        $scope.faceList = data;
        $scope.$apply();
    });

    $scope.faceStorage.findSwitcher(function(switcher){
        $scope.switcher = switcher;
        $scope.$apply();
    });

    $scope.add = function() {
        faceStorage.add($scope.newContent);
        $scope.newContent = '';
    }

    $scope.closeAlert = function() {
        faceStorage.closeAlert();
    }

    $scope.remove = function(face) {
        faceStorage.remove(face);
    }

    $scope.toggleSwitcher = function() {
        faceStorage.toggleSwitcher();
    }

    $scope.linkFacebook = function() {
        faceStorage.linkFacebook();
    }

    $scope.linkTwitter = function() {
        faceStorage.linkTwitter();
    }    



});
