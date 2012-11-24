var app = {
    ninja:{},
    orientation:'P',
    team:'',
    name:'',
    setup: function() {

        this._setupListeners();
        this._setupUser();
    },
    _setupUser: function() {

        if (!this._getName()) {
            // User Setup
            $('.user-setup').show();
            return;
        } else {
            $('.user-setup').hide();
            $('.js-welcome').text('Welcome '+this.name);
        }

        if (!this.team) {
            $('.team-setup').show();
            return;
        } else {
            $('.team-setup').hide();
        }
        $('.js-team').text(this.team);
        this.emit('UserReady');

    },
    _setName: function(name) {
        localStorage.setItem('name',name);
    },
    _getName: function() {
    this.name = localStorage.getItem('name');
        return this.name;
    },
    _setupListeners: function() {

        this.on('UserReady',function() {
            $('.voting').show()
            $('.js-vote').text((window.orientation===0) ? 'Bar' : 'Brothel')
            app._setupNinja();
        });

        this.on('NinjaReady',function() {
            var supportsOrientationChange = "onorientationchange" in window,
                orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

            window.addEventListener(orientationEvent, function() {
                app.orientation = (window.orientation===0) ? 'P' : 'L';
                $('.js-vote').text((window.orientation===0) ? 'Bar' : 'Brothel')
                app.vote.Emit(app.orientation);
                //document.body.innerHTML=app.orientation;
            }, false);

            app.vote.Rename(app._getName());
        });

        $('.js-set-user').on('click',function() {
            app._setName($('.js-user-name').val());
            app._setupUser();
        });

        $('.js-team').on('click',function() {
            app.team = this.dataset.team;
            app._setupUser();
        });


    },
    _setupNinja: function() {
        var options = {
            server: "https://staging.ninja.is",
            version: 0,
            userAccessToken: "a6e6d496-e099-4434-ab1d-6eb6bcf39a79"
        }
        this.ninja = new Ninja(options);

        var block = this._setupBlock(function(block) {

            app.vote = new app.ninja.Device({
                type: Ninja.DeviceTypes.UNDEFINED,
                deviceId: 14,
                vendor: 0,
                port: app.team
            });

            block.RegisterDevice(app.vote);

            app.vote.Emit(app.orientation,function() {
                app.emit('NinjaReady');
            });
        });
    },
    _setupBlock: function(cb) {

        var node = localStorage.getItem('nodeId'),
            token = localStorage.getItem('token');

        var block;

        if (node && token) {
            block = new app.ninja.Block({ nodeId: node, token: token});
            block.Listen();
            cb(block);
        } else {
            var num = Math.floor(Math.random()*10000)
            node = 'SAPIVIRTUALBLOCK'+num;

            var block = new app.ninja.Block({ nodeId: node });
            localStorage.setItem('nodeId',node);
            block.Activate(function(token) {
                localStorage.setItem('token',token);
                cb(block);
            });
            block.Claim();
        }

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