

angular.module('treehouseCourse', [])
  .controller('stageCtrl', function ($scope) {
    // $scope.user must be defined here since stageCtrl is the parent to the other controllers
    // but I am removing it to see if I can simply use the User service in multiple places

    $scope.step = 1

    $scope.advance = function() {
      $scope.step++
    }

    console.log("stageStepCtrl scope.id = "+$scope["$id"])
    console.log("stageStepCtrl parent.id = "+$scope.$parent.$id)

  })
  .controller('userStepCtrl', function ($scope, User, Survey) {
     
     $scope.user = User.get()
     $scope.survey = Survey.get()
     console.log("userStepCtrl user = "+JSON.stringify($scope.user))
     console.log("userStepCtrl scope.id = "+$scope["$id"])
     console.log("userStepCtrl parent.id = "+$scope.$parent.$id)     

  })
  .controller('surveyStepCtrl', function ($scope, User, Survey) {
     $scope.survey = Survey.get()
     $scope.user = User.get()
     console.log("surveyStepCtrl user = "+JSON.stringify($scope.user))
     console.log("surveyStepCtrl scope.id = "+$scope["$id"])
     console.log("surveyStepCtrl parent.id = "+$scope.$parent.$id)

  })
  .controller('resultsStepCtrl', function ($scope, User, Results, Survey) { // attaching Survey for quick fix to display questions
     $scope.surveyResults = Results.forQuestions([1, 2]) // Need to generate [1,2] dynamically
     $scope.user = User.get()
     $scope.getQuestion = Survey.getQuestion // kludgy fix, bringing this function out so that user question/answers can be brought out
     console.log("reultsStepCtrl user = "+JSON.stringify($scope.user))
     console.log("resultsStepCtrl scope.id = "+$scope["$id"])
     console.log("resultsStepCtrl parent.id = "+$scope.$parent.$id)     
     console.log("survey results = "+JSON.stringify($scope.surveyResults))
     console.log("user = "+JSON.stringify($scope.user))
  })     
  .factory('User', function () {
    var user = {
      gender: null,
      ageRange: null,
      surveyAnswers: {}
    }
    return {
      get:  function() {
        return user;
      }
    }
  })
  .factory('Survey', function() {
    var survey = {
      "title": "Treehouse Survey",
      "questions": [
        {
          "id": 1,
          "conditional": false,
          "questionText": "What is your favorite language?",
          "options": [
            "JavaScript",
            "Ruby",
            "Go",
            "Other"
          ]
        },

        {
          "id": 2,
          "conditional": false,
          "questionText": "Do you prefer cats or dogs?",
          "options": [
            "Cats",
            "Dogs",
            "Both are awesome",
            "Can't stand either"
          ]
        }
      ]
    }

    return {
      get: function () {
        //console.log("Survey.get called")
        return survey
      },
      // using underscore to find the question object that matches the question id
      // in array of question objects called questions
      getQuestion: function(id) {
        return _.find(survey.questions, function (question) {
          return question.id == id
        })
      }
    }

  })
  .factory('Results', function (Survey) {
    var results = {
      1: {
        "JavaScript": 40,
        "Ruby": 25,
        "Go": 15,
        "Other": 20
      },
      2: {
        "Cats": 5,
        "Dogs": 20,
        "Both are awesome": 15,
        "Can't stand either": 2        
      }
    }

    return {
      forQuestions: function (questionIds) {
        var questionResults = []
        for (var i = 0, ii = questionIds.length; i < ii; i++) {
          var id = questionIds[i]
          var result = {
            question: Survey.getQuestion(id),
            results: results[id]
          }
          questionResults.push(result)
        }
        return questionResults
      }
    }

  })
  .directive('barChart', function() {
    return {
      templateUrl: 'barChart.html',
      replace: true,
      scope: {
        'result': '=barChart'
      },
      link: function ($scope, $element, $attrs) {
        $scope.$watch('result', function() {
          calculateDynamics()
        }, true) 

        var calculateDynamics = function() {
          $scope.total = 0
          $scope.optionColors = {}
          _.each($scope.result.results, function(votes, option) {
            $scope.total += votes
            $scope.optionColors[option] = 'rgba(35,35,35,1)' // DRT Testing//'rgba(' + _.random(0,255) + ',' + _.random(0,255) _ ','+ _.random(0,255) + ',1)'
          })

        }

      }
    }
  })




//////////////////////////////////////////////////////////////////////////////////////////////

JSON.stringifyOnce = function(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value){
        if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
        return 'object too long';
        }
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index){
            if(obj===value){
                printedObjIndex = index;
            }
        });

        if ( key == ''){ //root element
             printedObjects.push(obj);
            printedObjectKeys.push("root");
             return value;
        }

        else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
            if ( printedObjectKeys[printedObjIndex] == "root"){
                return "(pointer to root)";
            }else{
                return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
            }
        }else{

            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if(replacer){
                return replacer(key, value);
            }else{
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
};
  
