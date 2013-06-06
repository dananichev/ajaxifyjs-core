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
        /**
         * init event listener for module handling
         * @returns {Loader} this
         */
        init: function() {
            var self = this;
            $(document).on("block-loaded.ajaxifyjs", function(event, element){
               self.initAppModules(element);
            });
            return self;
        },
        /**
         * init app modules
         * based on element's attributes
         * @param {DOM Element} elem
         * @returns {Loader} this
         */
        initAppModules: function(elem) {
            "use strict";
            var self = this;
            var module, callback;

            if (elem.is("[data-app-module]")) {
                module = elem.attr("data-app-module");
                callback = elem.attr("data-app-callback") || null;

                self.parseBinding(elem);
                self.loadModule(elem, module, callback, self.binding);
            }

            elem.find("[data-app-module]").each(function() {
                var $this = $(this);
                module = $this.attr("data-app-module");
                callback = $this.attr("data-app-callback") || null;

                self.parseBinding($this);
                self.loadModule($this, module, callback, self.binding);
            });

            return this;
        },
        /**
         * parse JSON-binding object
         * @param {DOM Element} elem
         * @returns {Loader} this
         */
        parseBinding: function(elem) {
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
        /**
         * load module using requireJS
         * @param {DOM Element} element
         * @param {string} module
         * @param {function} callback
         * @param {object} binding
         * @returns {Loader} this
         */
        loadModule: function(element, module, callback, binding){
            "use strict";

            var self = this;
            self.setStartTime(module);

            if (typeof requirejs !== "undefined") {
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
            } else {
                throw "RequireJS is not defined. Module loading disabled.";
            }

            return this;
        },
        /**
         * decode html in binding
         * IE compatibility
         * @param {string} value
         * @returns {string} result
         */
        htmlDecode: function(value){
            var result = '{}';
            if (value) {
                result = $('<div/>').html(value).text();
            }
            return result;
        },
        /**
         * set loading start time for single module
         * @param {string} module
         * @returns {Loader} this
         */
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

            return self;
        },
        /**
         * set loading stop time for single module
         * @param {string} module
         * @returns {Loader} this
         */
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

            return self;
        }
    };
}));