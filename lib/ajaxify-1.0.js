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
        // default options
        version: "1.0",

        settings: {
            multipleQueries: false, // if we're need to handle multiple active requests, turn this thing on
            debug: false
        },

        requestOptions: {
            method: 'get',
            timestamp: null,
            dataType: 'jsonp', // format of backend data
            blocks: null, // blocks, that we needed

            url: null,
            prevUrl: window.location.href || null,
            purifiedUrl: null,

            // callbacks
            preParseCallback: null,
            postParseCallback: null
        },

        _requestsPool: [],
        _loadingMessageTimer: null, // timer for displaying "loading" message
        _requestsEnabled: true,
        _requestTimeout: 60000,
        _ajaxLoading: ".ajaxLoading", // element or selector for "loading" container

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

        setUrl: function(url) {
            return this.requestOptions.url = url;
        },

        getUrl: function() {
            return this.requestOptions.url;
        },

        /** for Google Analytics */
        getRelativeUrl: function(url) {
            var hostname = window.location.host || window.location.hostname;
            var protocol = window.location.protocol;

            url = url.replace(protocol+"//", "").replace(hostname, "");
            return url;
        },

        sendRequest: function(options) {
            if (!options.url) {
                return false;
            }

            if (options) {
                this._setRequestOptions(options);
            }


            var _that = this;
            this.setUrl(this.requestOptions.url);
            if (!this.settings.multipleQueries) {
                //$("body").trigger("send-request.ajaxifyjs", options);
            }

            $(document).trigger("request-send.ajaxifyjs", options);

            //this.showLoadingMessage();

            var ajaxSettings = {
                url: this.getUrl(),
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

        _prepareRequest: function() {
            this.requestOptions.blocks = null;
            this.requestOptions.postParseCallback = null;
            this.requestOptions.preParseCallback = null;

            return this;
        },

        setRequestsEnabled: function(flag) {
            this._requestsEnabled = flag;
            return this._requestsEnabled;
        },

        validateStateChange: function() {
            return this._requestsEnabled;
        },

        isRequestsInProgress: function() {
            var result = false;
            if (this._requestsPool.length>0) {
                result = true;
            }
            return result;
        },

        _handleResponse: function(response) {
            if (typeof response !== 'undefined' && typeof response.content !== 'undefined') {
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
                    $(document).trigger("block-loaded.ajaxifyjs", $("[data-ajaxBlock="+key+"]"));
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

        _doneCallback: function(response, textStatus, jqXHR) {
            $(document).trigger("request-done.ajaxifyjs", response, jqXHR);

            this._handleResponse(response);

            if (this.settings.debug === true) {
                console.log("Ajaxify request done");
                console.log(this._requestsPool[response.timestamp].req);
            }

            //this.hideLoadingMessage();

            return this;
        },

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

            $(document).trigger("request-error.ajaxifyjs", jqXHR);

            return this;
        }
    }

}));