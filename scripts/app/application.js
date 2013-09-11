define(["jquery", "ajaxify", "history"], function($, ajaxify) {
    return {
        classes: {
            noAjax: ".no-ajax, .remove",
            noHistory: ".no-history, .b-overlay__activator",
            disabled: ".disabled, .flex-next, .flex-prev"
        },
        init: function(elem) {
            "use strict";

            $(document).trigger("block-loaded.ajaxifyjs", [$("body")]);
            this.ajaxifyInit();

            return this;
        },
        ajaxifyInit: function() {
            "use strict";

            var self = this;
            var rootUrl = window.location.protocol;

            $(document).on("click", "a[target!=_blank]", function(event) {
                var $this = $(this);
                if ($this.is(self.classes.noAjax)) {
                    return true;
                } else if ($this.is(self.classes.disabled)) {
                    return false;
                }

                var url = $this.attr("href") || null;
                var target = $this.attr("data-dynamicData") || null;
                var dataToSend = {};

                if (target) {
                    dataToSend.dynamicData = target;
                }

                var parents = $this.parents().map(function(){return this.className.split(" ")[0];}).get().slice(0,2);
                dataToSend.elementSelector = "."  + parents.reverse().join(" .");
                if (this.className) {
                    dataToSend.elementSelector += " ."  + this.className.split(" ")[0];
                } else {
                    dataToSend.elementSelector += " "  + this.tagName;
                }

                if (url !== null && url.length > 0) {
                    if (url.search("#") != '-1' && url.length > 1) {
                        $('html,body').animate({ scrollTop: $(url).offset().top }, {
                            duration: 'slow',
                            easing: 'swing',
                            complete: function() {
                                if ($(typeof $this.attr("rel") !== 'undefined' && $this.attr("rel").length > 0)) {
                                    var $firstInput = $(url).find($($this.attr("rel"))).find("input, textarea, select").eq(0);
                                    if ($firstInput.length > 0) {
                                        $firstInput.focus();
                                    }
                                }
                            }

                        });
                        return false;
                    }

                    $this.blur();

                    // if url is relative, then this is internal link
                    if (
                            url.search(rootUrl) == '-1'
                            && url.search("javascript:") == '-1'
                            && event.shiftKey !== true
                            && event.ctrlKey !== true
                            && event.altKey !== true
                        ) {
                        if ($this.is(self.classes.noHistory)) {
                            ajaxify.sendRequest({
                                url: url,
                                multipleQueries: true,
                                blocks: target || '',
                                preParseCallback: $this.data("preParseCallback") || null,
                                postParseCallback: $this.data("postParseCallback") || null
                            });
                        } else {
                            History.pushState(dataToSend, null, url);
                        }

                        event.preventDefault();
                        return false;
                    } else {
                        return true;
                    }
                }
            });

            // lets initialise our History module
            var History = window.History; // do not forget to use "H", instead of "h"

            if (!History.enabled) {
                return false;
            }

            // Note: We are using statechange instead of popstate
            History.Adapter.bind(window, 'statechange', function() {
                // we are using History.getState() instead of event.state
                var State = History.getState();
                var url = State.url;
                var elementSelector = State.data.elementSelector;
                var elem = $(elementSelector);

                if (url !== ajaxify.prevUrl) {
                    if (ajaxify.validateStateChange()) {
                        ajaxify.sendRequest({
                            url: url,
                            multipleQueries: true,
                            blocks: State.data.dynamicData || '',
                            preParseCallback: elem.data("preParseCallback") || null,
                            postParseCallback: elem.data("postParseCallback") || null
                        });

                        if ("_gaq" in window) {
                            _gaq.push(['_trackPageview', ajaxify.relativeUrl(url)]);
                        }
                    }
                }
            });
        }
    };
});