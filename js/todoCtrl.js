'use strict';

angular.module('app').controller('todoCtrl', function ($scope, todoStorage) {

    $scope.todoStorage = todoStorage;

    $scope.$watch('todoStorage.data', function() {
        $scope.todoList = $scope.todoStorage.data;
    });

    $scope.$watch('todoStorage.switcher', function() {
        $scope.switcher = $scope.todoStorage.switcher;
    });

    $scope.$watch('todoStorage.alert', function() {
        $scope.alert = $scope.todoStorage.alert;
    });    

    $scope.todoStorage.findAll(function(data){
        $scope.todoList = data;
        $scope.$apply();
    });

    $scope.todoStorage.findSwitcher(function(switcher){
        $scope.switcher = switcher;
        $scope.$apply();
    });

    $scope.add = function() {
        todoStorage.add($scope.newContent);
        $scope.newContent = '';
    }

    $scope.closeAlert = function() {
        todoStorage.closeAlert();
    }

    $scope.remove = function(todo) {
        todoStorage.remove(todo);
    }

    $scope.toggleSwitcher = function() {
        todoStorage.toggleSwitcher();
    }

    $scope.linkFacebook = function() {
        todoStorage.linkFacebook();
    }

    $scope.linkTwitter = function() {
        todoStorage.linkTwitter();
    }    



});
