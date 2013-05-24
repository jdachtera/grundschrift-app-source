enyo.kind({
    name:"Grundschrift.Views.RememberMe.Game",
    classes:"rememberMe",

    published:{
        levels:[],
        size:18,
        categories:[]
    },

    events:{
        onFinish:""
    },

    handlers:{
        onLevelsLoaded:"levelsLoaded"
    },

    lastField:null,
    tapCounter:0,

    components:[
        {classes: 'left', style: 'width: 48px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doFinish'}
        ]},
        {kind: 'FittableColumns', classes: 'enyo-fit', components: [
            {classes: 'right', name: 'right', fit: true, components: [
                {name:"board", classes:"board"}
            ]}
        ]},
        {kind:"Grundschrift.Views.RememberMe.FinishedPopup", onClose:"doFinish"}
    ],

    levelsChanged:function () {
        this.resetBoard();
    },

    categoriesChanged:function () {
        this.resetBoard();
    },

    resetBoard:function () {
        this.$.board.destroyClientControls();
        var indexes = [],
            fields = [],
            index,
            levels = enyo.filter(this.levels, function(level) {
                return enyo.indexOf(level.category, this.categories) > -1;
            }, this),
            size = 0;

        for (var k = 2; k < 10; k += 2){
            size = k * k / 2;
            if (size <= levels.length) {
                this.size = size;
            } else {
                break;
            }
        }


        if (this.categories.length > 0) {
            for (var i = 0; i < this.size; i++) {
                while (true) {
                    index = Math.round(Math.random() * (levels.length - 1));
                    if (enyo.indexOf(index, indexes) == -1) {

                        var field = {
                            kind:"Grundschrift.Views.RememberMe.Field",
                            level:levels[index],
                            ontap:"fieldTap"
                        };

                        indexes.push(index);
                        fields.push(field, field);

                        break;
                    }
                }
            }
        }

        this._array_shuffle(fields);

        this.$.board.createComponents(fields, {owner:this});

        this.$.board.render();

        this.resized();
    },

    fieldTap:function (inSender) {
        if (inSender.visible || this.tapCounter > 1) {
            return;
        }

        inSender.setVisible(true);

        var last = this.lastField;

        if (last == null) {
            this.lastField = inSender;
        } else {
            this.lastField = null;

            if (last.level === inSender.level) {
                this.tapCounter = 0;
                last.setVisible(true);
                inSender.setSolved(true);
                last.setSolved(true);
                if (this.gameFinished()) {
                    this.$.finishedPopup.show();
                }
                return;
            } else {
                setTimeout(enyo.bind(this, function () {
                    this.tapCounter = 0;
                    last.setVisible(false);
                    inSender.setVisible(false);
                }), 1000);
            }
        }
        this.tapCounter++;
    },

    gameFinished:function () {
        var finished = true;
        enyo.forEach(this.$.board.children, function (field) {
            finished &= field.visible;
        }, this);

        return finished;
    },

    sizeChanged:function () {
        this.size = Math.pow(Math.floor(Math.sqrt(this.size * 2)), 2);
    },

    _array_shuffle:function (inArray) {
        for (var i = 0; i < 100; i++) {
            inArray.sort(function () {
                return Math.round(Math.random() * 2 - 1);
            });
        }
    },

    resizeHandler:function () {
        enyo.asyncMethod(this, function() {
            var bounds = this.$.right.getBounds();
            var size = bounds.width > bounds.height ? bounds.height : bounds.width;
            this.$.board.applyStyle("height" ,size + "px");
            this.$.board.applyStyle("width" ,size + "px");
            var fieldSize = size / Math.sqrt(this.size * 2);
            enyo.forEach(this.$.board.children, function (field) {
                field.setSize(fieldSize);
            }, this);
        });

    },

    levelsLoaded:function (inSender, inLevels) {
        this.setLevels(inLevels);
    }

})




