enyo.kind({
    name:'Grundschrift.Views.Admin.EditChild',
    kind:'FittableRows',
    fit: true,
    classes:'editChild',
    published:{
        /**
         * The child to edit
         */
        child:-1
    },
    image:'',
    password:[],
    events:{
        /**
         * Is triggered when the child was changed
         */
        onChildrenChanged:'',
        onOpenStatistics:'',
        onBack: ''
    },
    components:[
        {kind:'onyx.Toolbar', style:'height:80px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'},
            {kind:"onyx.Button", content:"Statistik", ontap:"statisticsTap"},
            {kind:"onyx.Button", content:"Speichern", ontap:"saveTap"},
            {kind:"onyx.Button", content:"Löschen", ontap:"confirmDelete"}
        ]},
        {kind:'Scroller', fit:true, components:[
            {kind:'onyx.Groupbox', style: "width: 50%; margin: 10pt auto", components:[
                {kind: 'onyx.InputDecorator', components:[
                    {placeholder:'Name', kind:'onyx.Input', name:'name', onkeyup:'keyup'}
                ]},
                {kind: 'onyx.InputDecorator', components: [
                    {kind:'onyx.Checkbox', name:'leftHand', style:'margin-right:3pt'},
                    {content:'Linkshänder', style:'display:inline;'}
                ]},

                {kind: 'onyx.InputDecorator', components:[
                    {content:'Bild:'},
                    {kind:'Grundschrift.Views.CroppedImage', ontap:'childImageTap', style:'width:150pt;height:80pt;border:2px white solid;'}
                ]},
                {kind: 'onyx.InputDecorator', components:[
                    {content:'Password:'},
                    {kind:'FittableColumns', classes:'password', components:[

                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'1', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p0', ontap:'passwordImageTap', slot:0, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p1', ontap:'passwordImageTap', slot:0, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p2', ontap:'passwordImageTap', slot:0, index:3}
                        ]},
                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'2', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p3', ontap:'passwordImageTap', slot:1, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p4', ontap:'passwordImageTap', slot:1, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p5', ontap:'passwordImageTap', slot:1, index:3}
                        ]},
                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'3', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p6', ontap:'passwordImageTap', slot:2, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p7', ontap:'passwordImageTap', slot:2, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p8', ontap:'passwordImageTap', slot:2, index:3}
                        ]}
                    ]}
                ]}

            ]}
        ]},

        {name: 'confirmDelete', kind: 'onyx.Popup', style: 'padding: 10pt; text-align: center', modal: true, centered: true, components: [
            {content: 'Soll das Kind wirklich gelöscht werden?', style: 'margin-bottom: 10pt'},
            {kind: 'onyx.Button', content: 'Ja', ontap: 'deleteTap'},
            {kind: 'onyx.Button', content: 'Nein', ontap: 'closeConfirmDelete'}
        ]}


    ],

    /**
     * Fills the form with the childs properties
     * @protected
     * @returns void
     */
    childChanged:function () {
        this.image = this.child.imageUrl;
        this.$.croppedImage.setSrc(this.image);
        this.$.name.setValue(this.child.name);
        this.$.leftHand.setValue(this.child.leftHand);
        this.password.length = 0;
        enyo.forEach(this.child.password, function (p) {
            this.password.push(p);
        }, this);
        this.passwordChanged();
    },

    /**
     * Updates the password selector with the password value
     * @protected
     * @returns void
     */
    passwordChanged:function () {
        var img, i;
        for (i = 0; i < 9; i++) {
            img = this.$['p' + i];
            img.addRemoveClass('active', this.password[img.slot] === img.index);
        }
    },

    /**
     * password image tap handler
     * @param inSender
     * @protected
     * @returns void
     */
    passwordImageTap:function (inSender) {
        this.password[inSender.slot] = inSender.index;
        this.passwordChanged();
    },


    /**
     * Child image tap handler. Opens the camera application to take a picture.
     * @protected
     * @returns void
     */
    childImageTap:function () {

        navigator.camera.getPicture(enyo.bind(this, function (imageData) {
            //this.image = 'data:image/jpeg;base64,' + imageData;
            this.image = imageData;
            this.$.croppedImage.setSrc(this.image);
            this.show();
        }), function () {
        }, {
            quality:100,
            destinationType: Camera.DestinationType.FILE_URI,
            targetWidth:100,
            targetHeight:100
        });
    },
    /**
     * Request the Statistics Screen to be opened for the current child
     */
    statisticsTap:function () {
        this.bubble("onOpenStatistics", {
            child:this.child
        });
    },


    confirmDelete: function() {
        this.$.confirmDelete.show();
    },

    closeConfirmDelete: function() {
        this.$.confirmDelete.hide();
    },

    /**
     * Delete Button tap handler. Deletes the child.
     * @protected
     * @returns void
     */
    deleteTap:function () {
        this.child.sessions.list(enyo.bind(this, function (sessions) {
            enyo.forEach(sessions, function (session) {
                persistence.remove(session);
            }, this);
            persistence.remove(this.child);

            var cb = enyo.bind(this, function () {
                this.bubble('onChildrenChanged');
                this.bubble('onBack');
            });

            persistence.flush(function () {
                Grundschrift.Models.sync(['Child'], cb, cb);
            });
        }));
        this.hide();
    },

    /**
     * Name keyup Handler. Saves the child when Enter is pressed.
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    keyup:function (inSender, inEvent) {
        if (inEvent.keyIdentifier == 'Enter') {
            this.saveTap();
        }
    },

    /**
     * Save button tap handler. Saves the child
     * @protected
     * @returns void
     */
    saveTap:function () {
        this.child.name = this.$.name.getValue();
        this.child.password = this.password;
        this.child.imageUrl = this.image;
        this.child.leftHand = this.$.leftHand.getValue();
        persistence.add(this.child);

        var cb = enyo.bind(this, function () {
            this.bubble('onChildrenChanged');
            this.bubble('onBack');
        });
        persistence.flush(function () {
            Grundschrift.Models.sync(['Child'], cb, cb);
        });
    }
});
