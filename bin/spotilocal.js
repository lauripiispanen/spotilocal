var http     = require('http'),
    https     = require('https')
    _        = require('underscore'),
    username = process.argv[2],
    defaults = {
        method   : 'GET',
        headers  : {
            'Origin' : 'https://www.facebook.com'
        },
        scheme   : http
    },
    log      = function() { console.log(arguments); },
    song     = 'spotify:track:6JEK0CvvjDjjMUBFoXShNZ',
    req      = function(opts, dataCallback) {
        var options = _.extend({}, defaults, opts);        
        return options.scheme.request(options, function(res) {
                if (dataCallback) {
                    res.on('data', dataCallback);
                }
            }).on('error', log);
    },
    csrf     = function(callback) {
        req({
                hostname : '127.0.0.1',
                port     : 4380,
                path: '/simplecsrf/token.json',
            },
            function(data) {
                callback(JSON.parse(data.toString()).token);
            }
        ).end();
    },
    oauth    = function(song, callback) {
        req({
            path:     '/openplay/?uri=' + song,
            hostname: 'embed.spotify.com',
            scheme: https
        },
        function(data) {
            callback(/tokenData = '([^']*)/.exec(data.toString())[1]);
        }).end();
    },
    play    = function(uri) {
        oauth(song, function(oauthToken) {
            csrf(function(csrfToken) {
                req({
                        path: '/remote/play.json?uri=' + uri + '&oauth=' + oauthToken + '&csrf=' + csrfToken,
                        port: 4380,
                        hostname: '127.0.0.1'
                    }
                ).end();
            });
        });
    };


play(song);