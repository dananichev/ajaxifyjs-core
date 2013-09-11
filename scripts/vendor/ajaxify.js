(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery"], factory);
    } else {
        // Browser globals:
        window.Ajaxify = factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    return {
        /**
         * @this Ajaxify
         * @module Ajaxify
         * @class <Ajaxify>
         * @classdesc Ajaxify.js - library for handling requests to the server with easy-to-implement different handling for loading JS modules
         * @property {object} settings - default settings of ajaxify
         * @property {boolean} settings.multipleQueries - if we're need to handle multiple active requests, turn this thing on
         * @property {boolean} settings.debug - Just a flag
         * @property {string} settings.responseParamName - describes param name for JSON-variable that contains html-blocks
         * @property {object} requestOptions - default request options
         * @property {string} requestOptions.method - POST/GET/etc
         * @property {number} requestOptions.timestamp - request timestamp
         * @property {string} requestOptions.dataType - format of backend data
         * @property {string} requestOptions.blocks - blocks, that we needed to take from the server
         * @property {string} requestOptions.url - request url
         * @property {string} requestOptions.prevUrl - prev request url
         * @property {string} requestOptions.purifiedUrl - purified request url (some system-symbols replaced by safe symbols)
         * @property {function} requestOptions.preParseCallback - callback for pre-parse event (executed before Ajaxify's _hadleResponse())
         * @property {function} requestOptions.postParseCallback - callback for post-parse event (executed after Ajaxify's _hadleResponse())
         */
        version: "1.0",

        settings: {
            multipleQueries: false,
            responseParamName: "blocks",
            debug: false
        },

        requestOptions: {
            method: 'get',
            timestamp: null,
            dataType: 'jsonp',
            blocks: null,

            url: null,
            prevUrl: window.location.href || null,
            purifiedUrl: null,

            // callbacks
            preParseCallback: null,
            postParseCallback: null
        },

        /** @private */
        _requestsPool: [],
        /** @private */
        _loadingMessageTimer: null, // timer for displaying "loading" message
        /** @private */
        _requestsEnabled: true,
        /** @private */
        _requestTimeout: 60000,

        /**
         * init ajaxifyjs
         * some variables set to their defaults
         * @param {Object} options
         * @public
         * @returns {Ajaxify}
         */
        init: function(options) {
            this.settings = $.extend(this.settings, options);

            this.requestOptions.blocks = null;
            this.requestOptions.postParseCallback = null;
            this.requestOptions.preParseCallback = null;

            if (this.settings.debug === true) {
                console.log("Ajaxify init");
            }

            return this;
        },


        /**
         * gets or sets request url
         * @param {string|null} url
         * @public
         * @returns {string} this.requestOptions.url
         */
        url: function(url) {
            if (url) {
                this.requestOptions.url = url;
            }
            return this.requestOptions.url;
        },


        /**
         * get relative url
         * use for Google Analytics
         * @param {string} url
         * @public
         * @returns {string} url
         */
        relativeUrl: function(url) {
            var hostname = window.location.host || window.location.hostname;
            var protocol = window.location.protocol;

            url = url.replace(protocol+"//", "").replace(hostname, "");
            return url;
        },

        /**
         * send request to the server
         * @param {Object} options
         * @public
         * @callback Ajaxify~_failCallback
         * @callback Ajaxify~_doneCallback
         * @returns {Ajaxify}
         */
        sendRequest: function(options) {
            if (!options.url) {
                return false;
            }

            if (options) {
                this._setRequestOptions(options);
            }


            var _that = this;
            this.url(this.requestOptions.url);

            $(document).trigger("request-send.ajaxifyjs", [options]);

            var ajaxSettings = {
                url: this.url(),
                dataType: this.requestOptions.dataType,
                method: this.requestOptions.method,
                timeout: this._requestTimeout
            };

            if (this.settings.debug === true) {
                console.log("Ajaxify request start");
                console.log(ajaxSettings);
            }

            this._requestsPool[this.requestOptions.timestamp].req = $.ajax(ajaxSettings)
                .fail(function(jqXHR, textStatus, errorThrown) {
                    _that._failCallback.call(_that, jqXHR, textStatus, errorThrown);
                })
                .done(function(data, textStatus, jqXHR) {
                    _that._doneCallback.call(_that, data, textStatus, jqXHR);
                });

            return this;
        },


        /**
         * set request options
         * @param {Object} options
         * @private
         * @returns {Object} this.requestOptions
         */
        _setRequestOptions: function(options) {
            this._prepareRequest();

            this.requestOptions = $.extend(this.requestOptions, options);

            this.requestOptions.timestamp = new Date().getTime();
            this._requestsPool[this.requestOptions.timestamp] = {};
            this._requestsPool[this.requestOptions.timestamp].requestOptions = this.requestOptions;

            // if url does not have format pointer, add one
            if (this.requestOptions.url.search("format=") <= 0 && this.requestOptions.url.search(/\?/gi) <= 0) {
                this.requestOptions.url += '?format=' + this.requestOptions.dataType;
            } else if (this.requestOptions.url.search("format=") <= 0) {
                this.requestOptions.url += '&format=' + this.requestOptions.dataType;
            }

            this.requestOptions.url += "&timestamp=" + this.requestOptions.timestamp;

            // if we have pointed on some blocks, then send this info to server too
            if (this.requestOptions.blocks && this.requestOptions.blocks.length > 0) {
                var blocksString = this.requestOptions.blocks.split(' ').join('');
                this.requestOptions.url += '&content=' + blocksString;
                this._requestsPool[this.requestOptions.timestamp]._blocks = blocksString.split(',');
            }

            var indexOfFirstQuestionMark = this.requestOptions.url.search(/\?/gi);
            if (indexOfFirstQuestionMark != '-1') {
                var firstSegmentOfURI = this.requestOptions.url.substr(0, indexOfFirstQuestionMark + 1);
                var queryString = this.requestOptions.url.substr(indexOfFirstQuestionMark + 1);
                queryString = queryString.replace(/\?/g, encodeURIComponent("?")).replace(/#/g, encodeURIComponent("#")).replace(/\\/g, encodeURIComponent("\\"));
                this.requestOptions.url = firstSegmentOfURI + queryString;
            }

            this.cleanUrl = this.requestOptions.url;
            this.prevUrl = this.cleanUrl;

            return this.requestOptions;
        },

        /**
         * return some default values for request options
         * @private
         * @returns {Ajaxify} this
         */
        _prepareRequest: function() {
            this.requestOptions.blocks = null;
            this.requestOptions.postParseCallback = null;
            this.requestOptions.preParseCallback = null;

            return this;
        },

        /**
         * set request enabled flag
         * @param {boolean} flag
         * @public
         * @returns {boolean} this._requestsEnabled
         */
        setRequestsEnabled: function(flag) {
            this._requestsEnabled = flag;
            return this._requestsEnabled;
        },

        /**
         * if requests enabled returns true
         * used for validating request
         * @public
         * @returns {boolean} this._requestsEnabled
         */
        validateStateChange: function() {
            return this._requestsEnabled;
        },

        /**
         * returns true/false
         * depends on number of current requests
         * @public
         * @returns {boolean}
         */
        isRequestsInProgress: function() {
            var result = false;
            if (this._requestsPool.length>0) {
                result = true;
            }
            return result;
        },

        /**
         * parse response from the server
         * @param {String} response
         * @private
         * @returns {Ajaxify} this
         */
        _handleResponse: function(response) {
            if (typeof response !== 'undefined' && typeof response[this.settings.responseParamName] !== 'undefined') {
                if (typeof response.redirect !== "undefined") {
                    if (this.settings.debug === true) {
                        console.log("Redirected to: " + response.redirect);
                    }

                    window.location.assign(response.redirect);

                    return this;
                }

                if (this._requestsPool[response.timestamp].requestOptions.preParseCallback != null
                    && typeof(this._requestsPool[response.timestamp].requestOptions.preParseCallback) === 'function'
                    ) {
                    if (this.settings.debug === true) {
                        console.log("Pre-parse callback called");
                    }
                    response = this._requestsPool[response.timestamp].requestOptions.preParseCallback.call(this, response);
                }

                for (var key in response[this.settings.responseParamName]) {
                    var dynamicBlock = $("[data-ajaxBlock=" + key + "]");
                    dynamicBlock.find("*").remove();
                    if (typeof(dynamicBlock.attr("data-replaceSelf")) !== "undefined") {
                        dynamicBlock.replaceWith(response[this.settings.responseParamName][key]);
                    } else {
                        dynamicBlock.html(response[this.settings.responseParamName][key]);
                    }
                    if (this.settings.debug === true) {
                        console.log("Keys is:");
                        console.log(key);
                        console.log("Container contains:");
                        console.log(dynamicBlock.html());
                    }
                    $(document).trigger("block-loaded.ajaxifyjs", [dynamicBlock]);
                }

                if (this._requestsPool[response.timestamp].requestOptions.postParseCallback != null
                    && typeof(this._requestsPool[response.timestamp].requestOptions.postParseCallback) === 'function'
                    ) {
                    if (this.settings.debug === true) {
                        console.log("Callback called");
                    }
                    this._requestsPool[response.timestamp].requestOptions.postParseCallback.call(this, response);
                }

                // TODO: rewrite this code to be cross-browser (right now, bad support for IE7-8)
                if (typeof response.title !== "undefined" && response.title.length > 0) {
                    document.title = response.title;
                }

                delete(this._requestsPool[response.timestamp]);
            }

            return this;
        },

        /**
         * done callback for sendRequest() method
         * @param {String} response
         * @param {String} textStatus
         * @param {Object} jqXHR
         * @private
         * @returns {Ajaxify} this
         */
        _doneCallback: function(response, textStatus, jqXHR) {
            $(document).trigger("request-done.ajaxifyjs", [response, jqXHR]);

            this._handleResponse(response);

            if (this.settings.debug === true) {
                console.log("Ajaxify request done");
                console.log(response);
            }

            return this;
        },

        /**
         * fail callback for sendRequest() method
         * @param {Object} jqXHR
         * @param {String} textStatus
         * @param {String} errorThrown
         * @private
         * @returns {Ajaxify} this
         */
        _failCallback: function(jqXHR, textStatus, errorThrown) {
            if (this.settings.debug === true) {
                console.log("Ajaxify request error:");
                console.log(jqXHR);
            }

            var parsedResponse;
            if (typeof jqXHR !== "undefined" && typeof jqXHR.responseText === 'string') {
                parsedResponse = $.parseJSON(jqXHR.responseText);
            }

            if (parsedResponse) {
                var response = $.parseJSON(this._requestsPool[parsedResponse.timestamp].responseText);
                this._handleResponse(response);
            }

            $(document).trigger("request-error.ajaxifyjs", [jqXHR]);

            return this;
        }
    }

}));