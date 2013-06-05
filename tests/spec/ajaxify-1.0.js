define(["ajaxify-1.0", "mockjax", "jquery"], function(ajaxify) {
    describe(
        "ajaxify-1.0.js",
        function(){
            it(
                " / init() should return same instance",
                function(){
                    var settings = {};
                    expect(ajaxify.init(settings)).toBe(ajaxify);
                }
            );
            describe(
                " / request methods",
                function(){
                    var settingsSuccess = {
                        url: '/mock/200'
                    };
                    var settingsError = {
                        url: '/mock/500'
                    };
                    $.mockjax({
                        url: '/mock/200*',
                        contentType: 'text/json',
                        dataType: 'jsonp',
                        status: 200,
                        responseTime: 150,
                        responseText: { "content": "200" }
                    });
                    $.mockjax({
                        url: '/mock/500*',
                        contentType: 'text/json',
                        dataType: 'jsonp',
                        status: 500,
                        responseTime: 150,
                        responseText: { "content": "500" }
                    });
                    it(
                        " / sendRequest() should send request",
                        function(){
                            expect(ajaxify.sendRequest(settingsSuccess)).toBe(ajaxify);
                        }
                    );
                    it(
                        " / sendRequest() should call _setRequestOptions",
                        function(){
                            spyOn(ajaxify, "_setRequestOptions");
                            ajaxify.sendRequest(settingsSuccess);
                            expect(ajaxify._setRequestOptions).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / sendRequest() should call _doneCallback",
                        function(){
                            var deferred = new $.Deferred();
                            spyOn($, 'ajax').andReturn(deferred);

                            spyOn(ajaxify, '_doneCallback');
                            ajaxify.sendRequest(settingsSuccess);
                            deferred.resolve('done');

                            expect(ajaxify._doneCallback).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / sendRequest() should call _failCallback",
                        function(){
                            var deferred = new $.Deferred();
                            spyOn($, 'ajax').andReturn(deferred);

                            spyOn(ajaxify, "_failCallback");
                            ajaxify.sendRequest(settingsError);
                            deferred.reject('fail');

                            expect(ajaxify._failCallback).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / _setRequestOptions() should return new options",
                        function(){
                            var settings = {};
                            expect(ajaxify._setRequestOptions(settings)).toEqual(jasmine.any(Object));
                        }
                    );
                    it(
                        " / _setRequestOptions() should call _prepareRequest",
                        function(){
                            spyOn(ajaxify, "_prepareRequest");
                            ajaxify._setRequestOptions({url: '/'});
                            expect(ajaxify._prepareRequest).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / _prepareRequest() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._prepareRequest()).toBe(ajaxify);
                        }
                    );
                    it(
                        " / setRequestsEnabled() should return new value",
                        function(){
                            var flag = true;
                            expect(ajaxify.setRequestsEnabled(flag)).toEqual(flag);
                        }
                    );
                    it(
                        " / validateStateChange() should return ajaxify._requestsEnabled",
                        function(){
                            expect(ajaxify.validateStateChange()).toEqual(ajaxify._requestsEnabled);
                        }
                    );
                    it(
                        " / isRequestsInProgress() should return value",
                        function(){
                            expect(ajaxify.isRequestsInProgress()).not.toBeNull();
                        }
                    );
                }
            );
            describe(
                " / url methods",
                function(){
                    it(
                        " / setUrl() should return new url",
                        function(){
                            var url = '/test';
                            expect(ajaxify.setUrl(url)).toEqual(jasmine.any(String));
                        }
                    );
                    it(
                        " / getUrl() should return url",
                        function(){
                            expect(ajaxify.getUrl()).toEqual(jasmine.any(String));
                        }
                    );
                    it(
                        " / getRelativeUrl() should return url",
                        function(){
                            var url = "google.com/123";
                            expect(ajaxify.getRelativeUrl(url)).toEqual(jasmine.any(String));
                        }
                    );
                }
            );
            describe(
                " / response methods",
                function(){
                    it(
                        " / _handleResponse() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._handleResponse()).toBe(ajaxify);
                        }
                    );
                    it(
                        " / _doneCallback() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._doneCallback()).toBe(ajaxify);
                        }
                    );
                    it(
                        " / _failCallback() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._failCallback()).toBe(ajaxify);
                        }
                    );
                }
            );
        }
    );
});