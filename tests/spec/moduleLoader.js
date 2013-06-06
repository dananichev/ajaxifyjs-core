(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(["moduleLoader", "jquery"], factory);
    } else {
        // Browser globals:
        factory(window.Loader);
    }
}(function (loader) {
    describe(
        "moduleLoader.js",
        function(){
            it(
                " / init() should return same instance",
                function(){
                    var settings = {};
                    expect(loader.init(settings)).toBe(loader);
                }
            );
            describe(
                " / utils methods",
                function(){
                    it(
                        " / htmlDecode() should return decoded string",
                        function(){
                            var string = "Testing decode ability";
                            expect(loader.htmlDecode(string)).toEqual(jasmine.any(String));
                        }
                    );
                    it(
                        " / setStartTime() should return same instance",
                        function(){
                            var module = "test.module";
                            expect(loader.setStartTime(module)).toBe(loader);
                        }
                    );
                    it(
                        " / setStopTime() should return same instance",
                        function(){
                            var module = "test.module";
                            expect(loader.setStopTime(module)).toBe(loader);
                        }
                    );
                }
            );
            describe(
                " / modules methods",
                function(){
                    it(
                        " / initAppModules() should return same instance",
                        function(){
                            var element = $("<div />");
                            expect(loader.initAppModules(element)).toBe(loader);
                        }
                    );
                    it(
                        " / initAppModules() should call parseBinding()",
                        function(){
                            var element = $("<div data-app-module='ajaxify' />");
                            spyOn(loader, "parseBinding");
                            loader.initAppModules(element);
                            expect(loader.parseBinding).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / initAppModules() should call loadModule()",
                        function(){
                            var element = $("<div data-app-module='ajaxify' />");
                            spyOn(loader, "loadModule");
                            loader.initAppModules(element);
                            expect(loader.loadModule).toHaveBeenCalled();
                        }
                    );
                    it(
                        " / parseBindings() should return same instance",
                        function(){
                            var element = $("<div />");
                            expect(loader.parseBinding(element)).toBe(loader);
                        }
                    );
                }
            );
        }
    );
}));