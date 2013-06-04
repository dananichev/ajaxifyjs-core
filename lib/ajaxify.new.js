(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery", "module"], factory);
    } else {
        // Browser globals:
        window.Ajaxify = factory(window.jQuery, window.Loader);
    }
}(function ($, loader) {
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
                console.log("Ajaxify request start");
                console.log("URL: " + this.settings.url);
            }

            return this;
        },

        sendRequest: function(options) {
            if (this.settings.debug === true) {
                console.log("Ajaxify request start");
                console.log("URL: " + options.url);
            }

            if (!options.url) {
                return false;
            }

            if (options) {
                this._setRequestOptions(options);
            }
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
            return this;
        },

        _handleResponse: function() {

        },

        _doneCallback: function() {

        },

        _errorCallback: function() {

        }
    }

}));