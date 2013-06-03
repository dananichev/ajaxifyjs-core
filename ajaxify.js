(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery", "history", "moduleFactory"], factory);
    } else {
        // Browser globals:
        factory(window.jQuery, window.History, window.moduleFactory);
    }
}(function ($, H, mf) {
    'use strict';
    return {
        version: "1.0",
        settings: {
            method: 'get',
            format: 'jsonp', // format of backend data
            url: null, // url, which ajax request going to
            debug: false, // just a flag
            multipleQueries: false, // if we're need to handle multiple active requests, turn this thing on
            data: null, // blocks, that we needed
            preParseCallback: null,
            postParseCallback: null
        },
        timestamp: null,
        requestsPool: [],
        showLoadingMessageTimeout: null,
        requestsEnabled: true,
        prevUrl: window.location.href || null,
        cleanUrl: null,
        requestTimeout: 60000,
        _ajaxLoading: ".ajaxLoading", // maybe element or selector
        // default options
        init: function(settings) {
            "use strict";

            if (settings.url.length === 0 || (!settings.multipleQueries && this.requestsPool.length>0)) {
                return false;
            }

            this.timestamp = new Date().getTime();
            this.settings.data = null;
            this.settings.postParseCallback = null;
            this.settings.preParseCallback = null;
            this.requestsPool[this.timestamp] = {};

            this.setSettings(settings).encodeSpecialChars().setCleanUrl();

            if (this.settings.debug === true) {
                console.log("Ajaxify request start");
                console.log("URL: " + this.settings.url);
            }

            return this;
        },
        setCleanUrl: function() {
            "use strict";

            this.cleanUrl = this.settings.url;
            this.prevUrl = this.cleanUrl;

            return this;
        },
        setSettings: function(settings) {
            "use strict";

            this.settings = $.extend(this.settings, settings);

            // if url does not have format pointer, add one
            if (this.settings.url.search("format=") <= 0 && this.settings.url.search(/\?/gi) <= 0) {
                this.settings.url += '?format=' + this.settings.format;
            } else if (this.settings.url.search("format=") <= 0) {
                this.settings.url += '&format=' + this.settings.format;
            }

            this.settings.url += "&timestamp=" + this.timestamp;

            this.requestsPool[this.timestamp].settings = this.settings;

            // if we have pointed on some blocks, then send this info to server too
            if (this.settings.data && this.settings.data.length > 0) {
                var blocksString = this.settings.data.split(' ').join('');
                this.settings.url += '&content=' + blocksString;
                this.requestsPool[this.timestamp]._blocks = blocksString.split(',');
            }

            return this;
        },
        getUrl: function() {
            "use strict";

            return this.settings.url;
        },
        encodeSpecialChars: function() {
            "use strict";

            var indexOfFirstQuestionMark = this.settings.url.search(/\?/gi);
            if (indexOfFirstQuestionMark != '-1') {
                var firstSegmentOfURI = this.settings.url.substr(0, indexOfFirstQuestionMark + 1);
                var queryString = this.settings.url.substr(indexOfFirstQuestionMark + 1);
                queryString = queryString.replace(/\?/g, encodeURIComponent("?")).replace(/#/g, encodeURIComponent("#")).replace(/\\/g, encodeURIComponent("\\"));
                this.settings.url = firstSegmentOfURI + queryString;
            }

            return this;
        },
        sendRequest: function(settings) {
            var that = this;

            this.init(settings);

            if (!this.settings.multipleQueries) {
                $("body").trigger("ajaxCallInProgress");
            }

            this.showLoadingMessage();

            this.requestsPool[this.timestamp].req = $.ajax({
                url: this.getUrl(),
                dataType: "jsonp",
                method: this.settings.method,
                timeout: this.requestTimeout
            });

            this.requestsPool[this.timestamp].req.error(function(response, textStatus, errorThrown) {
                "use strict";
                that.errorCallback(response);
            }).done(function(response) {
                    "use strict";
                    that.doneCallback(response);
                });
        },
        doneCallback: function(response) {
            "use strict";

            if (typeof(response.redirect) !== "undefined") {
                if (this.settings.debug === true) {
                    console.log("Redirect to: " + response.redirect);
                }
                window.location.assign(response.redirect);

                return this;
            }

            if (this.requestsPool[response.timestamp].settings.preParseCallback != null
                && typeof(this.requestsPool[response.timestamp].settings.preParseCallback) === 'function'
                ) {
                if (this.settings.debug === true) {
                    console.log("Pre-parse callback called");
                }
                response = this.requestsPool[response.timestamp].settings.preParseCallback.call(this, response);
            }


            this.parseModules(response);

            if (this.requestsPool[response.timestamp].settings.postParseCallback != null
                && typeof(this.requestsPool[response.timestamp].settings.postParseCallback) === 'function'
                ) {
                if (this.settings.debug === true) {
                    console.log("Callback called");
                }
                this.requestsPool[response.timestamp].settings.postParseCallback.call(this, response);
            }

            if (this.settings.debug === true) {
                console.log(this.requestsPool[response.timestamp].req);
                console.log("Ajaxify request done");
            }

            // TODO: rewrite this code to be cross-browser (right now, bad support for IE7-8)
            // maybe i'll dig into replaceState().
            if (typeof response.title !== "undefined" && response.title.length > 0) {
                var State = History.getState();
                State.title = response.title;
                History.setTitle(State);
            }

            if (!this.settings.multipleQueries) {
                $("body").trigger("ajaxCallDone");
            }

            this.hideLoadingMessage();

            delete(this.requestsPool[response.timestamp]);

            return this;
        },
        errorCallback: function(response) {
            "use strict";

            if (typeof response.responseText === 'string') {
                response = $.parseJSON(response.responseText);
            }

            var resp = $.parseJSON(this.requestsPool[response.timestamp].responseText);

            if (this.settings.debug === true) {
                console.log(this.requestsPool[response.timestamp].req);
                console.log("Ajaxify request fail. Url: " + this.getUrl());
            }

            this.parseModules(resp);
        },
        parseModules: function(response) {
            "use strict";
            var self = this;

            if (typeof response.content !== 'undefined') {
                for (var key in response.content) {
                    var dynamicBlock = $("[data-ajaxBlock=" + key + "]");
                    dynamicBlock.find("*").remove();
                    if (typeof(dynamicBlock.attr("data-replaceSelf")) !== "undefined") {
                        dynamicBlock.replaceWith(response.content[key]);
                    } else {
                        dynamicBlock.html(response.content[key]);
                    }
                    if (this.settings.debug === true) {
                        console.log("Keys is:");
                        console.log(key);
                        console.log("Container contains:");
                        console.log(dynamicBlock.html());
                    }

                    mf.initAppModules($("[data-ajaxBlock="+key+"]"));
                }
            }
        },
        validateStateChange: function() {
            return this.requestsEnabled;
        },
        setDisableRequests: function() {
            this.requestsEnabled = false;
            return this;
        },
        setEnableRequests: function() {
            this.requestsEnabled = true;
            return this;
        },
        extractRelativeUrl: function(url) {
            var hostname = window.location.host || window.location.hostname;
            var protocol = window.location.protocol;

            url = url.replace(protocol+"//", "").replace(hostname, "");
            return url;
        },
        isRequestsInProgress: function() {
            var result = false;
            if (this.requestsPool.length>0) {
                result = true;
            }
            return result;
        },
        showLoadingMessage: function() {
            var self = this;

            this.showLoadingMessageTimeout = setTimeout(function(){
                $(self._ajaxLoading).show();
            }, 500);

            return this;
        },
        hideLoadingMessage: function() {
            var self = this;

            if (this.showLoadingMessageTimeout) {
                clearTimeout(this.showLoadingMessageTimeout);
            }
            $(self._ajaxLoading).show();

            return this;
        },
        setLoadingElement: function(elem) {
            this._ajaxLoading = elem;

            return this;
        }
    };
}));