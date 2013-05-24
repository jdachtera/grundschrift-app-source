/**
 * The child grid
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.EditChildren',
    kind:'FittableRows',
    classes:'childGrid',
    published:{
        /**
         * The children
         */
        childs:''
    },

    handlers:{
        onChildrenLoaded:'childrenLoaded'
    },

    events: {
        onBack: '',
        onChildSelected: ''
    },

    components:[
        {kind:'onyx.Toolbar', style:'height:80px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'},
            {kind:'onyx.Button', content:'Benutzer hinzufügen', ontap:'addNewChild'}
        ]},
        {kind:'Grundschrift.Views.GridList',
            name:'childGrid',
            onSetupItem:'setupItem',
            onItemTap:'childTap',
            fit:true,
            components:[
                {kind:'Grundschrift.Views.ChildItem'}
        ]}
    ],

    childrenLoaded:function (inSender, inChildren) {
        this.setChilds(inChildren);
    },

    /**
     * Re-renders the child list on changes
     * @protected
     * @return void
     */
    childsChanged:function () {
        this.$.childGrid.setCount(this.childs.length);
        this.$.childGrid.refresh();
    },

    /**
     * Child tap handler - opens the editing popup
     * @param inSender The event sender
     * @param inEvent The event
     * @protected
     * @return void
     */
    childTap:function (inSender, inEvent) {
        this.bubble('onChildSelected', {
            child: this.childs[inEvent.item.index]
        });
    },

    /**
     * Adds a new Child
     * @protected
     * @return void
     */
    addNewChild:function () {
        this.bubble('onChildSelected', {
            child: new Grundschrift.Models.Child({
                name:'',
                password:[1, 1, 1],
                imageUrl:'assets/images/rememberMeBackside.png'
            })
        });
    },

    /**
     * Renders a single item of the child grid
     * @param inSender The event sender
     * @param inEvent The event
     * @protected
     * @return void
     */
    setupItem:function (inSender, inEvent) {
        var i = inEvent.index;
        inEvent.item.$.childItem.setName(this.childs[i].name);
        inEvent.item.$.childItem.setImage(this.childs[i].imageUrl);
    }

});
