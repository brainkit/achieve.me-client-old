(function () {
    'use strict';
    var serverName = "http://pixelweb.tmweb.ru/";
    var hashKey = "$2y$10$MPO7P1iQjxtHewmnOO.GK.XJcwvGI7cLDkKaACISc8yI.Sfi9np1O";
    var deviceId = "6u3254165";
    var hash = localStorage.getItem('hash');
    //var achievements = localStorage.getItem('achievements');


    //  alert(hash);

    var Onsen = angular.module('myApp', ['onsen.directives', 'angularFileUpload', 'ngTouch'], function ($httpProvider)
    {
        // Используем x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        // Переопределяем дефолтный transformRequest в $http-сервисе
        $httpProvider.defaults.transformRequest = [function (data)
            {
                /**
                 * рабочая лошадка; преобразует объект в x-www-form-urlencoded строку.
                 * @param {Object} obj
                 * @return {String}
                 */
                var param = function (obj)
                {
                    var query = '';
                    var name, value, fullSubName, subValue, innerObj, i;

                    for (name in obj)
                    {
                        value = obj[name];

                        if (value instanceof Array)
                        {
                            for (i = 0; i < value.length; ++i)
                            {
                                subValue = value[i];
                                fullSubName = name + '[' + i + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if (value instanceof Object)
                        {
                            for (subName in value)
                            {
                                subValue = value[subName];
                                fullSubName = name + '[' + subName + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        }
                        else if (value !== undefined && value !== null)
                        {
                            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                        }
                    }

                    return query.length ? query.substr(0, query.length - 1) : query;
                };

                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            }];
    });

    // localStorage.setItem('user', 'bar');


    Onsen.controller('StartUp', function ($scope) {
        //$scope.greeting = "Good Night!";
        $scope.startText = "Пара слов о том, что за приложение. Коротко, ясно, просто. И слоган :)";

        if (hash != null)
        {
            ons.ready(function () {
                gotoStart();
            });
        }
    });


    Onsen.controller('formRegister', function ($scope, $http) {
        $scope.submit = function () {
            var url = serverName + "/api/user";
            //?hash=
            // console.log("jsonp->"); 
            $http.post(url, {hash: hashKey, email: $scope.email, password: $scope.password, deviceId: deviceId})
                    .success(function (data)
                    {
                        if (data.hash)
                        {
                            hash = data.hash;
                            localStorage.setItem('hash', data.hash);
                            alert("Вы успешно зарегистрировались!");
                            gotoStart();
                        }

                    });
        }

        /* $scope.register = function () {
         // alert(1);
         $scope.msg = 'clicked';
         }*/
    });

    Onsen.controller('formLogin', function ($scope, $http) {
        $scope.submit = function () {
            //   alert(1);
            var url = serverName + "/auth";
            $http.post(url, {email: $scope.email, password: $scope.password})
                    .success(function (data)
                    {
                        if (data.hash)
                        {
                            hash = data.hash;
                            localStorage.setItem('hash', data.hash);
                            gotoStart();
                        }
                    })
                    .error(function () {
                        alert("Логин или пароль введен неверно!");
                    });
        }

    });

    Onsen.controller('editProfile', function ($scope, $http, $upload) {
        var url = serverName + "/api/user-settings?hash=" + hash;
        $scope.userPhoto ="img/avatar-def.png";
        
        $http.get(url).success(function (data)
        {
            $scope.userName = data.name;
            $scope.userPhoto = serverName + data.photo;
        }).error(function () {
            // alert("Логин или пароль введен неверно!");
            //alert("error!");
        });


        $scope.changeName = function () {
            var url = serverName + "/api/user-settings/update";
            $http.post(url, {hash: hash, name: $scope.userName})
                    .success(function ()
                    {
                        // console.log(data);
                    })
                    .error(function () {
                        // alert("Логин или пароль введен неверно!");
                    });
        };

        $scope.changePhoto = function ($files) {
            var url = serverName + "/api/user-settings/update";
            var file = $files[0];

            $scope.upload = $upload.upload({
                url: url, //upload.php script, node.js route, or servlet url
                method: 'POST',
                //headers: {'header-key': 'header-value'},
                //withCredentials: true,
                data: {myObj: $scope.uploadPhoto, hash: hash},
                file: file, // or list of files ($files) for html5 only
                //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                // customize file formData name ('Content-Disposition'), server side file variable name. 
                fileFormDataName: "photo", //or a list of names for multiple files (html5). Default is 'file' 
                // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                //formDataAppender: function(formData, key, val){}
            }).progress(function (evt) {
                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                var percent = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadStatus = "Загрузка: " + percent + "%";
            }).success(function (data, status, headers, config) {
                $scope.uploadStatus = "Аватар загружен!";
            });
        };
    });

    Onsen.controller('Profile', function ($scope, $http) {

        var url = serverName + "/api/user-settings?hash=" + hash;
        $scope.userPhoto = 'img/avatar-def.png';
        $http.get(url).success(function (data)
        {
            $scope.userName = data.name;
            $scope.userPhoto = serverName + data.photo;
        }).error(function () {
            //alert("error!");
        });


        var url = serverName + "/api/user-achievements?hash=" + hash;
        $http.get(url).success(function (data)
        {
            $scope.items = data.data;

        }).error(function () {
            //alert("error!");
        });

        var url = serverName + "/api/user-achievements-count?hash=" + hash;
        $http.get(url).success(function (data)
        {
            $scope.countAch = parseInt(data);

        }).error(function () {
            //alert("error!");
        });

    });

    Onsen.controller('AddAchievement', function ($scope, $http) {
        var url = serverName + "/api/achievements?hash=" + hash;
        //var test = {"total": 20, "per_page": 100, "current_page": 1, "last_page": 1, "from": 1, "to": 20, "data": [{"id": "11", "parent_id": null, "title": "\u0421\u0430\u043c\u043e\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u044b\u0439", "description": "\u041f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043b\u0430\u0439\u043a \u043f\u043e\u0434 \u0441\u0432\u043e\u0435\u0439 \u0437\u0430\u043f\u0438\u0441\u044c\u044e", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "12", "parent_id": null, "title": "\u041d\u0435\u0431\u0435\u0441\u0430 \u043f\u043e\u0434\u043e\u0436\u0434\u0443\u0442", "description": "\u041f\u0440\u044b\u0433\u043d\u0443\u0442\u044c \u0441 \u043f\u0430\u0440\u0430\u0448\u044e\u0442\u043e\u043c", "points": "500", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "13", "parent_id": null, "title": "\u0412\u043e\u0440\u043e\u0448\u0438\u043b\u043e\u0432\u0441\u043a\u0438\u0439 \u0441\u0442\u0440\u0435\u043b\u043e\u043a", "description": "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0444\u043b\u0435\u0448\u043a\u0443 \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e \u0441 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u0440\u0430\u0437\u0430", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "15", "parent_id": null, "title": "\u041e\u0434\u0438\u043d \u0432 \u0442\u0435\u043c\u043d\u043e\u0442\u0435", "description": "\u041f\u0435\u0440\u0435\u0436\u0438\u0442\u044c \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442\u0430", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "16", "parent_id": null, "title": "\u0412\u0435\u0440\u0430 \u0432 \u0447\u0443\u0434\u043e", "description": "\u0416\u0434\u0430\u0442\u044c \u0432\u044b\u0445\u043e\u0434\u0430 Half-life 3", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "17", "parent_id": null, "title": "\u0427\u0443\u0434\u0435\u0441\u0430 \u0431\u044b\u0432\u0430\u044e\u0442", "description": "\u0414\u043e\u0436\u0434\u0430\u0442\u044c\u0441\u044f \u0432\u044b\u0445\u043e\u0434\u0430 Half-life 3", "points": "1000", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "18", "parent_id": null, "title": "\u042d\u0444\u0438\u0440\u043d\u043e\u0435 \u043c\u043e\u043b\u0447\u0430\u043d\u0438\u0435", "description": "\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0432\u0441\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0441\u0432\u044f\u0437\u0438 \u043c\u0438\u043d\u0438\u043c\u0443\u043c \u043d\u0430 \u0434\u0435\u043d\u044c", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "19", "parent_id": null, "title": "\u0428\u0435\u0440\u043b\u043e\u043a \u0425\u043e\u043b\u043c\u0441", "description": "\u0418\u0441\u043a\u0430\u0442\u044c \u043f\u0440\u0435\u0434\u043c\u0435\u0442 \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u0441\u044f \u043d\u0430 \u0442\u0435\u0431\u0435", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "20", "parent_id": null, "title": "\u0422\u043e\u0447\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442", "description": "\u041f\u0440\u043e\u0441\u043d\u0443\u0442\u044c\u0441\u044f \u0437\u0430 \u043c\u0438\u043d\u0443\u0442\u0443 \u0434\u043e \u0437\u0432\u043e\u043d\u043a\u0430 \u0431\u0443\u0434\u0438\u043b\u044c\u043d\u0438\u043a\u0430", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "21", "parent_id": null, "title": "\u0423\u0441\u0442\u043e\u0439\u0447\u0438\u0432 \u043a\u0430\u043a \u043f\u0438\u0440\u0430\u043c\u0438\u0434\u0430", "description": "\u041d\u0435 \u0440\u0430\u0437\u0443 \u043d\u0435 \u0443\u043f\u0430\u0441\u0442\u044c \u0437\u0430 \u0437\u0438\u043c\u0443", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "22", "parent_id": null, "title": "\u0421\u043b\u043e\u0436\u043d\u044b\u0435 \u0432\u0440\u0435\u043c\u0435\u043d\u0430", "description": "\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043d\u0430 \u0447\u0430\u0441\u044b \u0434\u0432\u0430 \u0440\u0430\u0437\u0430 \u0438 \u043d\u0435 \u0437\u0430\u043f\u043e\u043c\u043d\u0438\u0442\u044c \u0432\u0440\u0435\u043c\u044f", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "23", "parent_id": null, "title": "\u0421\u043f\u0430\u0441\u0438\u0431\u043e, \u0447\u0442\u043e \u0436\u0438\u0432\u043e\u0439", "description": "\u041f\u0435\u0440\u0435\u0436\u0438\u0442\u044c \u043f\u043e\u0445\u043e\u0434 \u043a \u0441\u0442\u043e\u043c\u0430\u0442\u043e\u043b\u043e\u0433\u0443", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "24", "parent_id": null, "title": "\u0417\u0438\u043c\u0430 \u043d\u0435 \u0431\u0443\u0434\u0435\u0442!", "description": "\u041d\u0435 \u0437\u0430\u043c\u0435\u0442\u0438\u0442\u044c, \u043a\u0430\u043a \u043f\u0440\u0438\u0448\u043b\u0430 \u0437\u0438\u043c\u0430", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "25", "parent_id": null, "title": "\u041b\u043e\u0432\u043a\u0430\u0447", "description": "\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c \u043c\u043d\u043e\u0433\u043e \u0437\u0430\u043d\u044f\u0442\u0438\u0439, \u043d\u043e \u0441\u0434\u0430\u0442\u044c \u0441\u0435\u0441\u0441\u0438\u044e \u043b\u0443\u0447\u0448\u0435 \u0442\u0435\u0445, \u043a\u0442\u043e \u043f\u043e\u0441\u0435\u0449\u0430\u043b", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "26", "parent_id": null, "title": "\u0417\u0430\u0441\u043b\u0443\u0436\u0435\u043d\u043d\u044b\u0439 \u043e\u0442\u0434\u044b\u0445", "description": "\u0421\u0434\u0430\u0442\u044c \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u044e \u0441\u0441\u0435\u0441\u0438\u044e", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "27", "parent_id": null, "title": "\u0425\u0430\u0442\u0438\u043a\u043e", "description": "\u041f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c \u043d\u0435 \u043f\u0440\u0438\u0448\u0435\u043b \u043d\u0430 \u044d\u043a\u0437\u0430\u043c\u0435\u043d\u044b", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "28", "parent_id": null, "title": "\u042f \u2014 \u043b\u0435\u0433\u0435\u043d\u0434\u0430!", "description": "\u0421\u0434\u0430\u0442\u044c \u044d\u043a\u0437\u0430\u043c\u0435\u043d \u0441 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u0440\u0430\u0437\u0430", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "29", "parent_id": null, "title": "\u041f\u0440\u0438\u0448\u0435\u043b, \u0443\u0432\u0438\u0434\u0435\u043b, \u043f\u043e\u0431\u0435\u0434\u0438\u043b", "description": "\u0421\u0434\u0430\u0442\u044c \u044d\u043a\u0437\u0430\u043c\u0435\u043d \u0431\u0435\u0437 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0438", "points": "100", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "30", "parent_id": null, "title": "\u0412\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u0435 \u0433\u0435\u0440\u043e\u044f", "description": "\u0414\u043e\u0436\u0434\u0430\u0442\u0441\u044f \u0432\u0442\u043e\u0440\u043e\u0439 \u0432\u0435\u0440\u0441\u0438\u0438 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f", "points": "1000", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}, {"id": "31", "parent_id": null, "title": "\u041a\u0430\u0442\u0430\u0440\u0441\u0438\u0441", "description": "\u0414\u043e\u0432\u0435\u0441\u0442\u0438 \u043f\u0440\u043e\u0435\u043a\u0442 \u0434\u043e \u0440\u0435\u043b\u0438\u0437\u0430", "points": "500", "image": null, "created_at": "-0001-11-30 00:00:00", "updated_at": "-0001-11-30 00:00:00", "deleted_at": null}]};
        //$scope.items = test.data;

       
        $http.get(url).success(function (data)
        {
            $scope.items = data.data;
           
        }).error(function () {
            //alert("error!");
        });


        $scope.unlockAchievement = function () {
            var objItem = this;
            this.styleContent = {'background-color': '#3472a1'};

            var url = serverName + "/api/user-achievements";

            $http.post(url, {hash: hash, achievement_id: this.item.id})
                    .success(function ()
                    {

                        alert("Достижение разблокировано!");

                        objItem.styleContent = {'background-color': '#1b1b1b'};
                    })
                    .error(function () {
                        // alert("Логин или пароль введен неверно!");
                        //objStyle.styleContent = {'background-color': 'red'};
                    });/**/

        };
    });

})();
