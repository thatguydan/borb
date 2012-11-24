var app = {
    token:'a6e6d496-e099-4434-ab1d-6eb6bcf39a79',
    startTime:10,
    voteTime:8,
    teamA:{},
    guns: {
        A:'2712BB000635_1_0_1002',
        B:'2712BB000635_3_0_1002'
    },
    teamB:{},
    vote:false,
    setup: function() {
        var pusher = new Pusher('ccff70362850caf79c9f');
        var channel = pusher.subscribe('803f01f3-676c-4bd4-a8eb-319c175f102f');
        channel.bind('data', function(data) {
          app.registerVote(data);
        });

        var sec = app.startTime;
        var iv = setInterval(function() {
            $('.vote-countdown').text(sec--+' seconds until vote begins');
            if (sec===0) {
                clearInterval(iv);
                app._beginVote();
            }
        },1000);
    },
    registerVote: function(deviceData) {

        if (deviceData.V!==0||deviceData.D!==14) {
            return;
        }

        if (!app['team'+deviceData.G].hasOwnProperty(deviceData.GUID)) {
            console.log("New voter in team "+deviceData.G);
            app._addVoter(deviceData);

            // Device doesn't exist, pop it in
        } else {
            $('.team-'+deviceData.G+' li[data-guid="'+deviceData.GUID+'"] span').text(deviceData.DA)
        }

        app['team'+deviceData.G][deviceData.GUID] = deviceData;

    },
    _beginVote: function() {
        var sec = app.voteTime;
        $('.vote-countdown').text(sec+' seconds until vote ends');
        var iv = setInterval(function() {
            sec--;
            $('.vote-countdown').text(sec+' seconds until vote ends');
            if (sec===0) {
                clearInterval(iv);
                app._endVote();
            }
        },1000);

        setInterval(function() {
            $('.teams').hide();
            $('.debate-name').show();
        },0)
    },
    _endVote: function() {
        $('.vote-countdown').text("Vote over");
        setTimeout(function() {
            $('.vote-countdown').hide();
        },1000);
        $('.debate-name h1').append(' is a ... <span>');
        setTimeout(function() {
            $('.debate-name h1 span').text(cat);
        },3000);
        setTimeout(function() {
            var results = app._countVote();
            app._displayResults(results);
        },4000);
    },
    _countVote: function() {
        var _teamA=0,_teamB=0;

        for (var i in this.teamA) {
            if (this.teamA.hasOwnProperty(i)) {
                if (cat==='Bar'&&this.teamA[i].DA==='P') _teamA++;
                else if (cat==='Brothel'&&this.teamA[i].DA==='L') _teamA++;

            }
        }

        for (var i in this.teamB) {
            if (this.teamB.hasOwnProperty(i)) {
                if (cat==='Bar'&&this.teamB[i].DA==='P') _teamB++;
                else if (cat==='Brothel'&&this.teamB[i].DA==='L') _teamB++;
            }
        }



        return {
            teamA: _teamA/Object.keys(this.teamA).length||0,
            teamB: _teamB/Object.keys(this.teamB).length||0
        }
    },
    _shootTeam: function(team) {
        var guid = this.guns[team];
        $.ajax({
            type:'PUT',
            url:'https://staging.ninja.is/rest/v0/device/'+guid+'?user_access_token='+app.token,
            data: {
                DA:1
            }
        })
        setTimeout(function() {
             $.ajax({
                type:'PUT',
                url:'https://staging.ninja.is/rest/v0/device/'+guid+'?user_access_token='+app.token,
                data: {
                    DA:0
                }
            })
        },2000);

    },
    _displayResults: function(results) {
        $('.debate-results span.teamA').text((Math.round(results.teamA*100))+'%');
        $('.debate-results span.teamB').text((Math.round(results.teamB*100))+'%');


        if (results.teamA<0.5&&results.teamB<0.5) {
            $('.vote-decision').text('Everybody failed and gets a face full of Nerf.')
            this._shootTeam('A');
            this._shootTeam('B');
        }
        else if (results.teamA>0.85&&results.teamB>0.85) {
            // Both teams > 90% correct, do nothing
            $('.vote-decision').text('Everybody got an HD. No Nerf this time.')

        } else if (results.teamA>results.teamB) {

            // Team A wins
            $('.vote-decision').text('Team B gets a face full of Nerf')
            this._shootTeam('B')

        } else if (results.teamA<results.teamB) {


            // Team B wins
            $('.vote-decision').text('Team A gets a face full of Nerf')
            this._shootTeam('A')

        }
        $('.debate-results').show();
    },
    _addVoter: function(deviceData) {
        $.get('https://staging.ninja.is/rest/v0/device/'+deviceData.GUID
            ,{user_access_token:'a6e6d496-e099-4434-ab1d-6eb6bcf39a79'}
            ,function(data) {
                $.extend(app['team'+deviceData.G][deviceData.GUID],data.data);
                $('.team-'+deviceData.G).append(
                    '<li data-guid="'+deviceData.GUID+'">'
                    +data.data.shortName
                    +' <span>'
                    +deviceData.DA
                    +'</span></ul>'
                );
        });
    },
    emit: function(evt,data) {
        $(document).trigger(evt,data);
    },
    on: function(evt,fn) {
        $(document).on(evt,fn);
    }
};

$(document).ready(function() {
    app.setup();
    console.log('Ready');

});