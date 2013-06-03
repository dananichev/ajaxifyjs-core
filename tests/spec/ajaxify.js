define(["ajaxify", "mockjax"], function(ajaxify) {
    describe(
        "ajaxify.js - library for handling ajax-requests to the server.",
        function(){
            // Testing application entry point
            it(
                "should return same instance",
                function(){
                    var settings = {};
                    expect(ajaxify.init(settings)).toBe(ajaxify);
                }
            );
            it(
                "should send request",
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
        }
    );
});