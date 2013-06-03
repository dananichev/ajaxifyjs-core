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

        },

        sendRequest: function(url, options) {

        },

        _setRequestOptions: function(options) {

        },

        _prepareRequest: function() {

        },

        _handleResponse: function() {

        },

        _doneCallback: function() {

        },

        _errorCallback: function() {

        }
    }

}));