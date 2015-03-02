var http = require('http');
var qs = require('querystring');
var url = require('url');

// The port to listen for incoming HTTP requests on
var LISTEN_PORT = process.env.PORT || 3000;

function processRequest(httpPostData, successCallback, errorCallback) {
    var Tproxy = require('temboo/core/tembooproxy');
    var Tsession = require('temboo/core/temboosession');
    var Twitter = require('temboo/Library/Twitter/Search');

    // Initialize Temboo session
    var session = new Tsession.TembooSession("glsee", "myFirstApp", "3f0213bdc3b540679a663b621ca997a0");

    // Initialize our request proxy
    var tembooProxy = new Tproxy.TembooProxy();

    // Instantiate the Choreo
    var tweetsChoreo = new Twitter.Tweets(session);

    // Add Choreo proxy with an ID for the JS Library
    tembooProxy.addChoreo('jsTweets', tweetsChoreo);

    // Instantiate and populate the input set for the Choreo
    var tweetsInputs = tweetsChoreo.newInputSet();

    // Set credential to use for execution
    tweetsInputs.setCredential('Hashtangular');

    tembooProxy.setDefaultInputs('jsTweets', tweetsInputs);

    // Whitelist client inputs
    tembooProxy.allowUserInputs('jsTweets', 'Query');

    // Execute the requested Choreo
    tembooProxy.execute(httpPostData['temboo_proxy'], true, successCallback, errorCallback);
}

// Initialize web server
http.createServer(function(request, response) {
    // Examine requested URL
    var resource = url.parse(request.url).pathname;

    if(resource == '/proxy-server'){
        var body = '';

        request.on('data', function(data) {
            body += data;
        });

        request.on('end', function () {
            // Grab the POST data
            var httpPostData = qs.parse(body);

            // Handle JS SDK request
            processRequest(
                httpPostData,
                function(result){
                    console.log('Success! ' + result);
                    response.end(result);
                },
                function(err){
                    console.log('Error: ' + err);
                    response.end(err);
                }
            );
        });

        // Set content type for JSON response
        response.writeHeader(200, {"Content-Type": "application/json"});
    }
}).listen(LISTEN_PORT);
