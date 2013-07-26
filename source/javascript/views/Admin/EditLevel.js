/**
 * The view for editing the paths for a level
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.EditLevel',
    kind:'Grundschrift.Views.Admin.BaseView',
    layoutKind:'FittableColumnsLayout',
    published:{
        /**
         * The level that is beeing edited
         */
        level:''
    },
    events:{
        /**
         * Is triggered by the back button
         */
        onBack:'',

        onControlValuesChanged:''
    },

    components:[
    /**
     * The controls on the left
     */
        {kind:'FittableRows', style:'width:25%', components:[
            {kind:'onyx.Toolbar', components:[
                {kind:'ImageButton', type:'application-exit', ontap:'doBack'}
            ]},
            {kind:'Scroller', style:'margin:10px', fit:true, components:[
                {name:'currentPath', caption:'Pfad:', disabled:true, kind:"Grundschrift.Views.IntegerSlider", min:-1, max:-1, value:-1, onChange:"publishValues"},
                {name:'currentPoint', caption:'Punkt:', disabled:true, kind:"Grundschrift.Views.IntegerSlider", min:-1, max:-1, value:-1, onChange:"publishValues"},
                {kind:'FittableColumns', style:'line-height: 32px; height: 32px;font-weight: bold', components:[
                    {content:'Ankerpunkt:', fit:true},
                    {kind:'onyx.Checkbox', name:'anchorpoint', onchange:'publishValues'},

                ]},
                //{content: 'Nachbearbeitung', tag: 'h2'},
                {name:'currentLineWidth', caption:'Linienbreite:', kind:"Grundschrift.Views.IntegerSlider", min:1, max:100, value:10, onChange:"publishValues"},
                {name:'thinning', caption:'Ausdünnung:', kind:"Grundschrift.Views.IntegerSlider", min:0, max:30, value:0, onChange:"publishValues"},
                {name:'interpolation', caption:'Interpolation:', kind:"Grundschrift.Views.IntegerSlider", min:0, max:30, value:0, onChange:"publishValues"},
                {name:'smoothness', caption:'Glättung:', kind:"Grundschrift.Views.IntegerSlider", min:0, max:50, value:0, onChange:"publishValues"},
                {kind:'onyx.Button', content:'Änderungen fixieren', ontap:'applyModifications'}


            ]},
            {kind:'onyx.Toolbar', defaultKind:'ImageButton', components:[
                {type:'edit-delete', ontap:'deleteActivePath'},
                {type:'document-save-5', ontap:'savePaths'},
                {type:'document-send', ontap:'sendToDeveloper'}
            ]}


        ]},

    /**
     * The canvas on the right
     */
        {kind:'Control', name:'editCanvasContainer', fit:true, components:[
            {kind:'Grundschrift.Views.Admin.EditCanvas', fit:true, onValuesChanged:'updateControlValues'}
        ]}
    ],


    /**
     * Updates the canvas and the controls when the level is changed.
     * @param inSender The event sender
     * @param inEvent The event
     * @protected
     * @return void
     */
    levelChanged:function (inSender, inEvent) {
        this.$.editCanvas.setLevel(this.level);
        this.publishValues();
    },

    /**
     * Delete Button tap handler - deletes the current path.
     * @protected
     * @return void
     */
    deleteActivePath:function () {
        this.$.editCanvas.deleteActivePath();
    },

    publishValues:function () {
        var values = {
            currentPath:this.$.currentPath.getValue(),
            currentPoint:this.$.currentPoint.getValue(),
            isAnchor:this.$.anchorpoint.getValue(),

            lineWidth:this.$.currentLineWidth.getValue(),
            smoothness:this.$.smoothness.getValue(),
            interpolation:this.$.interpolation.getValue(),
            thinning:this.$.thinning.getValue()
        };

        this.waterfall('onControlValuesChanged', values);
    },

    /**
     * Updates the control values from the canvas values.
     * @protected
     * @return void
     */
    updateControlValues:function (inSender, inValues) {
        var max = inValues.paths.length - 1;
        this.$.currentPath.setMax(max);
        this.$.currentPath.setMin(max > -1 ? 0 : -1);
        this.$.currentPath.setValue(inValues.currentPath);

        max = inValues.paths.length && inValues.paths[inValues.currentPath] ? inValues.paths[inValues.currentPath].length - 1 : -1;
        this.$.currentPoint.setMax(max);
        this.$.currentPoint.setMin(max > -1 ? 0 : -1);
        this.$.currentPoint.setValue(inValues.currentPoint);

        this.$.anchorpoint.setValue(max > -1 ? inValues.paths[inValues.currentPath][inValues.currentPoint].isAnchor : false);

        this.$.currentLineWidth.setValue(inValues.lineWidth);
        this.$.thinning.setValue(inValues.thinning);
        this.$.smoothness.setValue(inValues.smoothness);
        this.$.interpolation.setValue(inValues.interpolation);
    },


    /**
     * Save Button tap handler - saves the level changes
     * @protected
     * @return void
     */
    savePaths:function () {
        this.saveLevel(enyo.bind(this, function () {
            this.bubble('onLevelsChanged');
            this.bubble('onBack');
        }));
    },

    /**
     * Save the level and call a callback when ready
     * @param callback Th callback
     */
    saveLevel:function (callback) {
        var paths = this.$.editCanvas.getPaths(),
            level = this.$.editCanvas.getLevel(),
            lineWidth = this.$.editCanvas.getLineWidth();

		Grundschrift.Models.db.levels.attach(level);

		level._lastChange = Date.now();
        level.lineWidth = lineWidth;
        level.setPaths(enyo.cloneArray(paths), function() {
			Grundschrift.Models.db.saveChanges(callback);
		});

    },

    /**
     * Sends the level to the developer via email.
     */
    sendToDeveloper:function () {
        this.saveLevel(enyo.bind(this, function () {
            var level = this.$.editCanvas.getLevel();
            this.bubble('onLevelsChanged');
            this.bubble('onBack');

            window.open(
                'mailto:' + Grundschrift.Models.developerEmail +
                    '?subject=' + encodeURIComponent('[Grundschrift Level] ' + level.category + ' => ' + level.name) +
                    '&body=' + encodeURIComponent(enyo.json.stringify({
                    "id":level.id,
                    "name":level.name,
                    "category":level.category,
                    "illustrations":level.illustrations,
                    "className":level.className,
                    "unlockCondition":level.unlockCondition,
                    "lineWidth":level.lineWidth,
                    "_lastChange":level._lastChange,
                    "paths": this.$.editCanvas.getPaths()
                }, undefined, 2))
            );

        }));
    },

    applyModifications:function () {
        this.$.editCanvas.applyModifications();

        this.$.smoothness.setValue(0);
        this.$.interpolation.setValue(0);
        this.$.thinning.setValue(0);
    }
});