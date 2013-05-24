/**
 * The menu to select a level to edit
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    kind:'FittableRows',
    name:'Grundschrift.Views.Admin.EditLevels',
    classes:'levelGrid',
    style:'height:100%',

    published:{
        /**
         * The levels
         */
        levels:''
    },

    handlers:{
        onLevelsLoaded:'levelsLoaded'
    },

    events: {
        onBack: '',
        onLevelSelected: ''
    },

    components:[
        {kind:'onyx.Toolbar', style:'height:80px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'}
        ]},
        {kind:'Grundschrift.Views.GridList',
            name:'levelsList',
            onItemTap:'levelTap',
            fit:true,
            minItemWidth:100,
            onSetupItem:'setupLevelItem',
            components:[
                {name:'levelItem', classes:'level-item', kind:"Control"}
            ]}
    ],

    levelsLoaded:function (inSender, inLevels) {
        this.setLevels(inLevels);
    },


    /**
     * Renders a cell for the LevelGrid
     * @param inSender The event sender
     * @param inEvent The event
     * @protected
     * @return void
     */
    setupLevelItem:function (inSender, inEvent) {
        var l = this.levels[inEvent.index];
        if (l) {
            if (inEvent.update !== true) {
                inEvent.item.$.levelItem.setContent(l.name);
            }
            inEvent.item.$.levelItem.addRemoveClass('hasPaths', l.getPaths().length > 0);
        }
    },

    /**
     * Triggers a re-render of the level grid when the levels are changed.
     * @protected
     * @return void
     */
    levelsChanged:function () {
        this.$.levelsList.refresh(this.levels.length);
    },

    /**
     * Level tap Handler
     * @param inSender
     * @param inEvent
     * @protected
     * @return void
     */
    levelTap:function (inSender, inEvent) {
        this.bubble('onLevelSelected', {level:this.levels[inEvent.item.index]});
    }
});