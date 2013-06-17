requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '../src',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: 'vendor/jquery-2.0.1.min',
        mockjax: 'vendor/jquery.mockjax'
    },
    shim: {
        'mockjax': {
            deps: ['jquery']
        }
    }
});
