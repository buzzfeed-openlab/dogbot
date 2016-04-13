var request = require('request'),
    Particle = require('particle-api-js'),
    config = require('./config.json');

var particle = new Particle();
var particleToken;

var fbToken = config.facebookConfig.client_id + '|' + config.facebookConfig.client_secret;
var fbURI = 'https://graph.facebook.com/v2.6/' + config.facebookConfig.video_id + '/comments?access_token=' + fbToken + '&order=reverse_chronological';

var seenComments = {};

function containsAnyOf(needles, haystack) {
    for (var i = 0; i < needles.length; ++i) {
        if (haystack.indexOf(needles[i]) != -1) {
            return needles[i];
        }
    }
    return undefined;
};

function queryComments(cb) {
    console.log('querying...');

    request.get(fbURI, function(err, response, body) {
        if(err) {
            return console.log('error querying facebook:', err);
        }

        body = JSON.parse(body);
        if (!body.data || !body.data.length) {
            console.log('no comments: ', body);
            return;
        }

        var comments = body.data;

        var numTriggers = 0;
        for (var i = 0; i < comments.length; ++i) {
            var comment = comments[i];

            if (seenComments[comment.id]) {
                break;
            }

            console.log('new comment: ', comment);

            // normalize the comment
            var message = comment.message.toLowerCase();

            // record that we've seen this comment
            seenComments[comment.id] = message;

            // check the comment for triggers
            if (containsAnyOf(config.triggers, message)) {
                ++numTriggers;
            }
        }

        // if there were triggers, feed the dogs!
        if (numTriggers && config.reallyActuallyTrigger) {
            var publishEventPr = particle.publishEvent({ name: 'feed', data: {}, auth: particleToken });

            publishEventPr.then(
              function(data) {
                console.log('published event: ', data);
              },
              function(err) {
                console.log('failed to publish event:', err);
              }
            );
        }

    });
}

particle.login(config.particleConfig).then(
    function(data) {
        console.log('connected to particle');
        particleToken = data.body.access_token;

        setInterval(queryComments, config.interval);
    },

    function(err) {
        console.log('ERROR: FAILED TO LOGIN\n', err);
    }
);
