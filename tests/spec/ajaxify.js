define(["ajaxify"], function(ajaxify) {
    describe(
        "ajaxify.js - library for handling ajax-requests to the server.",
        function(){
            // Testing application entry point
            it(
                "should return same instance",
                function(){
                    expect(ajaxify.init()).toBe(ajaxify);
                }
            );
        }
    );
});