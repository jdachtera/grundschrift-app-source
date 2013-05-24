/**
 * The children menu view
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.ChildMenu',
    kind:'Grundschrift.Views.BaseView',
    classes:'childGrid',

    published:{
        /**
         * The children
         * this.children is already used by enyo so we call it childs ;)
         */
        childs:[]

    },

    events:{
        /**
         * Is fired when a child was tapped
         */
        onChildSelected:'',
        onBack:'',
        onSettingsClicked:''
    },

    handlers:{
        onChildrenLoaded:'childrenLoaded'
    },

    components:[
        {kind:'onyx.Toolbar', components:[
            //{kind: 'ImageButton', type: 'application-exit', ontap: 'doBack'},
            {kind:'ImageButton', type:'Settings', ontap:'doSettingsClicked'}
        ]},
        {kind:'Grundschrift.Views.GridList',
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
     * Setups a row for the child grid
     * @param inSender The gridlist
     * @param inEvent The event
     * @protected
     * @returns void
     */
    setupItem:function (inSender, inEvent) {
        var i = inEvent.index;
        inEvent.item.$.childItem.setName(this.childs[i].name);
        inEvent.item.$.childItem.setImage(this.childs[i].imageUrl);
    },

    /**
     * Re-renders the grid when the childs are changed
     * @protected
     * @returns void
     */
    childsChanged:function () {
        this.$.gridList.setCount(this.childs.length);
        this.$.gridList.refresh();

    },

    /**
     * Fires the onItemSelected event
     * @param inSender
     * @param inRow
     * @protected
     * @returns void
     */
    childTap:function (inSender, inEvent) {
        this.bubble('onChildSelected', {child:this.childs[inEvent.item.index]});
    }
});