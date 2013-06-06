# AjaxifyJS :: About
AjaxifyJS created for fast and easy to maintain consistent and stable Ajax-driven apps.
You can include Ajaxify.js as AMD module or use it without any wrapper: just link it thru <script> tag.

# Samples
## Via AMD-module
    require(["ajaxify"], function(ajaxify) {
        ajaxify.init({
            debug: false,
            multipleQueries: true
        });

        $("a").on("click", function(){
            ajaxify.sendRequest({
                url: this.href
            });
        });
    });

## Via <script>
    var ajaxify = window.Ajaxify;
    ajaxify.init({
        debug: false,
        multipleQueries: true
    });

    $("a").on("click", function(){
        ajaxify.sendRequest({
            url: this.href
        });
    });

## Expected response from server
    jsonpCallbackFunc({
        "content": "%some-html-code%"
    })