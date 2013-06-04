define(["ajaxify.new", "mockjax"], function(ajaxify) {
    describe(
        "ajaxify.js",
        function(){
            it(
                "init() should return same instance",
                function(){
                    var settings = {};
                    expect(ajaxify.init(settings)).toBe(ajaxify);
                }
            );
            describe(
                "request methods",
                function(){
                    it(
                        "sendRequest() should send request",
                        function(){
                            var settings = {
                                url: '/mock/200',
                                format: 'json'
                            };
                            $.mockjax({
                                url: '/mock/200',
                                responseTime: 750,
                                responseText: {
                                    status: 'success',
                                    content: '1231231213 123123'
                                }
                            });
                            expect(ajaxify.sendRequest(settings)).toBe(ajaxify);
                        }
                    );
                    it(
                        "sendRequest() should call _setRequestOptions",
                        function(){
                            spyOn(ajaxify, "_setRequestOptions");
                            ajaxify.sendRequest({url: '/'});
                            expect(ajaxify._setRequestOptions).toHaveBeenCalled()
                        }
                    );
                    it(
                        "_setRequestOptions() should return new options",
                        function(){
                            var settings = {};
                            expect(ajaxify._setRequestOptions(settings)).toEqual(jasmine.any(Object));
                        }
                    );
                    it(
                        "_setRequestOptions() should call _prepareRequest",
                        function(){
                            spyOn(ajaxify, "_prepareRequest");
                            ajaxify._setRequestOptions({url: '/'});
                            expect(ajaxify._prepareRequest).toHaveBeenCalled()
                        }
                    );
                    it(
                        "_prepareRequest() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._prepareRequest()).toBe(ajaxify);
                        }
                    );
                    it(
                        "setRequestsEnabled() should return new value",
                        function(){
                            var flag = true;
                            expect(ajaxify.setRequestsEnabled(flag)).toEqual(flag);
                        }
                    );
                }
            );
            describe(
                "url methods",
                function(){
                    it(
                        "setUrl() should return new url",
                        function(){
                            var url = '/test';
                            expect(ajaxify.setUrl(url)).toEqual(jasmine.any(String));
                        }
                    );
                    it(
                        "getUrl() should return url",
                        function(){
                            expect(ajaxify.getUrl()).toEqual(jasmine.any(String));
                        }
                    );
                }
            );
            describe(
                "response methods",
                function(){
                    it(
                        "_handleResponse() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._handleResponse()).toBe(ajaxify);
                        }
                    );
                    it(
                        "_doneCallback() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._doneCallback()).toBe(ajaxify);
                        }
                    );
                    it(
                        "_errorCallback() should return same instance",
                        function(){
                            var settings = {};
                            expect(ajaxify._errorCallback()).toBe(ajaxify);
                        }
                    );
                }
            );
        }
    );
});