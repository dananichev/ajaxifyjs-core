(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery"], factory);
    } else {
        // Browser globals:
        window.Loader = factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    return {
        version: "1.0",
        binding: {},
        flushStatsTimer: null,
        stats: {},
        isStatsEnabled: false,
        initAppModules: function(elem) {
            "use strict";
            var that = this;
            var module, callback;

            if (elem.is("[data-app-module]")) {
                module = elem.attr("data-app-module");
                callback = elem.attr("data-app-callback") || null;

                that.parseBindings(elem).loadModule(elem, module, callback, that.binding);
            }

            elem.find("[data-app-module]").each(function() {
                var $this = $(this);
                module = $this.attr("data-app-module");
                callback = $this.attr("data-app-callback") || null;

                that.parseBindings($this).loadModule($this, module, callback, that.binding);
            });

            return this;
        },
        parseBindings: function(elem) {
            "use strict";
            this.binding = {};
            var jsonString = this.htmlDecode(elem.attr("data-binding"));

            if (jsonString) {
                try {
                    this.binding = $.parseJSON(jsonString);
                } catch(e) {
                    throw "Malformed JSON-data: " + jsonString;
                }
            }

            return this;
        },
        loadModule: function(element, module, callback, binding){
            "use strict";

            var self = this;
            self.setStartTime(module);

            requirejs([module], function(mod) {
                if (typeof mod !== 'undefined' && typeof mod.init == 'function') {
                    // passing element as parametr to init method of module
                    mod.init(element, binding);
                    self.setStopTime(module);
                }

                // checking for callback existance and initializing callback
                if (callback && callback.indexOf(".")) {

                    var objectReference = callback.split(".");
                    self.setStartTime(objectReference[0]);

                    requirejs([objectReference[0]], function(cb) {
                        // callback init method expect 2 parametrs to be given: module instance and element
                        cb[objectReference[1]](mod, element);
                        self.setStopTime(objectReference[0]);
                    })
                }
            });

            return this;
        },
        htmlDecode: function(value){
            var result = '{}';
            if (value) {
                result = $('<div/>').html(value).text();
            }
            return result;
        },
        setStartTime: function(module) {
            "use strict";

            var self = this;

            if (self.isStatsEnabled) {
                var timestamp = new Date().getTime();
                if (typeof self.stats[module] == "undefined") {
                    self.stats[module] = {};
                }
                self.stats[module].startTime = timestamp;
            }
        },
        setStopTime: function(module) {
            "use strict";

            var self = this;
            if (self.isStatsEnabled) {
                var timestamp = new Date().getTime();
                if (typeof self.stats[module] == "undefined") {
                    self.stats[module] = {};
                }
                self.stats[module].stopTime = timestamp;
            }
        }
    };
}));