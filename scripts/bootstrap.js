requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts/vendor',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        ajaxify: 'ajaxify',
        jquery: 'jquery-2.0.3.min',
        bootstrap: 'bootstrap.min',
        history: 'jquery.history'
    },
    shim: {
        history: {
            deps: ['jquery']
        }
    }
});

requirejs(
    ["app/application", "bootstrap"],
    function(app) {
        app.init();
    }
);