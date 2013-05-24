/**
 * The sound manager is a global singleton.
 * It loads all the sounds from a json index file and creates Sound objects for each of them.
 */
enyo.singleton({
    name:"Grundschrift.Models.SoundManager",
    kind:"Component",
    indexFile:"assets/sounds/index.json",
    index:null,
    context:null,
    media:{},
    deviceReady:false,
    basePath: '',
    components:[
        {kind:"Signals", ondeviceready:"onDeviceReady"}
    ],
    create: function () {
        this.inherited(arguments);

        this.loadIndex();
    },
    loadIndex: function () {
        new enyo.Ajax({
            url:this.indexFile
        }).response(this,function (inSender, inResponse) {
                this.index = inResponse;
                this.init();
            }).error(console.log).go();
    },
    onDeviceReady: function () {
        this.deviceReady = true;
        if (device.platform === "iOS") {
            this.basePath = location.pathname.split('/').slice(0,-1).join('/') + '/';
        } else if (device.platform === "Android") {
            this.basePath = "/android_asset/www/";
        }
        this.init();
    },
    init: function () {
        var name;
        if (this.deviceReady && this.index) {
            for (name in this.index) {
                if (this.index.hasOwnProperty(name)) {
                    this.media[name] = new Grundschrift.Models.Sound(this._getAudioPath(name));
                }
            }
        }
    },
    replaceUmlauts: function(string) {
        return string.toString()
            .replace(/ä/g, 'ae')
            .replace(/ü/g, 'ue')
            .replace(/ö/g, 'oe')
            .replace(/ß/g, 'sz');
    },
    play: function (name) {
        if (this.deviceReady && this.index) {
            name = this.replaceUmlauts(name);
            this.stop();
            if (this.media[name]) {
                return this.media[name].play();
            }
        }
    },
    stop: function () {
        for (var k in this.media) {
            this.media[k].stop();
        }

    },
    _getAudioPath: function (name) {
        var ext = "mp3",
            path = this.basePath + "assets/sounds/";

        return path + ext + "/" + this.index[name] + "." + ext;
    }
});