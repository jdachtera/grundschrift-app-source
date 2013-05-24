/**
 * A simple password screen for children using a combination of three images
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Password',
    kind:'Grundschrift.Views.BaseView',

    published:{
        /**
         * The password as an array of numbers 0-2
         */
        password:''
    },

    events:{
        /**
         * Is triggered when the user clicked the right combination
         */
        onAccessGranted:'',
        /**
         * is triggered when the user clicks on the back button
         */
        onBack:''
    },

    components:[
        {kind:'onyx.Toolbar', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'},
            {kind:'ImageButton', type:'Refresh', ontap:'reset'}
        ]},
        {kind:'Control', classes:'password', components:[
            {classes:'inputImages', components:[
                {components:[
                    {kind:'Image', name:'input1', src:''}
                ]},
                {components:[
                    {kind:'Image', name:'input2', src:''}
                ]},
                {components:[
                    {kind:'Image', name:'input3', src:''}
                ]}
            ]},

            {kind:'Image', style:'height:10%', name:'emoticon', src:''},

            {classes:'passwordImages', components:[
                {components:[
                    {kind:'Image', src:'assets/images/password1.png', ontap:'click', index:1}
                ]},
                {components:[
                    {kind:'Image', src:'assets/images/password2.png', ontap:'click', index:2}
                ]},
                {components:[
                    {kind:'Image', src:'assets/images/password3.png', ontap:'click', index:3}
                ]}
            ]}
        ]}

    ],

    /**
     * Initialize some variabeles
     * @protected
     * @return void
     */
    create:function () {
        this.inherited(arguments);
        this.input = [];
        this.reset();
    },


    /**
     * Resets the password input
     * @public
     * @return void
     */
    reset:function () {
        this.$.emoticon.setSrc('assets/icons/blank.png');
        this.input.length = 0;
        for (var i = 1; i < 4; i++) {
            this.$['input' + i].setSrc('assets/images/passwordBlank.png');
        }
    },

    /**
     * Tap handler for password images
     * @protected
     * @return void
     */
    click:function (inSender, inEvent) {
        this.$.emoticon.setSrc('assets/icons/blank.png');
        this.input.push(inSender.index);
        this.$['input' + this.input.length].setSrc(inSender.src);
        if (this.input.length == this.password.length) {
            for (var i = 0; i < this.input.length; i++) {
                if (this.input[i] != this.password[i]) {
                    this.reset();
                    this.$.emoticon.setSrc('assets/icons/face-uncertain.png');
                    return;
                }
            }
            this.$.emoticon.setSrc('assets/icons/face-smile-2.png');
            this.doAccessGranted();
        }
        return true;
    }
});
