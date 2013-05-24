enyo.kind({
    name:"Grundschrift.Views.Admin.Statistics",
    kind:"FittableColumns",
    classes:"statistics",

    published:{
        child:"",
        session:"",
        sessionIndex:0,
        showOnlySuccessFul:false
    },

    events:{
        onBack:""
    },

    handlers:{
        onLevelsLoaded:'levelsLoaded',
        onSessionsLoaded:'sessionsLoaded'
    },

    category:"",
    sessions:[],
    sessionTree:{},
    style:"height:100%",

    lastTappedNode: null,

    components:[
        {kind:"FittableRows", style:"width:33%", components:[
            {kind:"onyx.Toolbar", style:"height:80px", components:[
                {kind:'ImageButton', type:'Exit', ontap:'doBack'}
            ]},
            {name:"sessionTree", kind:"Scroller", fit:true}

        ]},
        {kind:"FittableRows", style:"width:67%;height:100%", components:[
            {kind:"onyx.Toolbar", style:"height:80px", components:[
                {kind:"onyx.Button", name:"prev", disabled:true, content:"Zurück", value:-1, ontap:"changeSession"},
                {name:"sessionIndex", content:0},
                {kind:"onyx.Button", name:"next", disabled:true, content:"Weiter", value:1, ontap:"changeSession"},
                {kind:"onyx.Button", name:"replay", disabled:true, content:">", ontap:"replay"}
            ]},
            {kind:"Grundschrift.Views.Admin.Graph", fit:true}
        ]}


    ],

    sessionsLoaded:function (inSender, sessions) {
        this.sessionTree = {};
        enyo.forEach(sessions, function (session) {
            if (typeof this.sessionTree[session.level.category] === "undefined") {
                this.sessionTree[session.level.category] = {};
            }

            var category = this.sessionTree[session.level.category];

            if (!(category[session.level.name])) {
                category[session.level.name] = {successful:[], unsuccessful:[]};
            }

            category[session.level.name][session.success ? 'successful' : 'unsuccessful'].push(session);

        }, this);

        this.updateSessionTree();
        this.$.graph.reset();
        this.session = "";
        this.sessions = [];
        this.sessionIndex = 0;
    },

    childChanged: function() {
        this.bubble('onSessionsChanged');
    },



    sessionsTap:function (inSender) {
        if (this.lastTappedNode) {
            this.lastTappedNode.setSelected(false);
        }
        this.lastTappedNode = inSender;
        inSender.setSelected(true);
        this.sessions = inSender.sessions;
        this.sessionIndex = 0;
        this.changeSession({value:0});
    },

    replay:function () {
        this.$.graph.replay();
    },

    changeSession:function (inSender) {
        if (inSender.disabled) return;

        this.sessionIndex += inSender.value;

        this.$.sessionIndex.setContent(this.sessionIndex);

        this.$.next.setDisabled(this.sessionIndex >= this.sessions.length - 1 ? true : false);
        this.$.prev.setDisabled(this.sessionIndex <= 0 ? true : false);

        if (this.sessions.length) {

            Grundschrift.Models.Session.load(this.sessions[this.sessionIndex].id, enyo.bind(this, function (session) {
                this.setSession(session);
            }));

        }
    },

    sessionChanged:function () {
        this.$.replay.setDisabled(typeof this.session === "undefined");

        if (this.session) {

            this.$.graph.setLevel(this.session.level);
            this.$.graph.drawBackground();
            this.$.graph.setPaths(this.session.getPaths());
        } else {
            this.$.graph.clear();
        }
    },

    updateSessionTree:function (inSender, inEvent) {
        var category,
            level,
            sessions,
            nodes = [],
            node;

        for (category in this.sessionTree) {
            node = {content:category, kind:"Node", components:[], expandable:true, expanded:true};
            for (level in this.sessionTree[category]) {
                sessions = this.sessionTree[category][level];

                var sum = sessions.successful.length + sessions.unsuccessful.length;
                var rate = Math.round((sum > 0 ? sessions.successful.length / sum : 0) * 100);

                node.components.push({
                    content: level + ": " + rate + "% von " + sum,
                    expandable:true,
                    expanded:false,
                    components: [
                        {
                            content: "erfolgreich (" + sessions.successful.length + ")",
                            showing: sessions.successful.length,
                            sessions: sessions.successful,
                            onNodeTap:"sessionsTap"
                        },
                        {
                            content: "fehlerhaft (" + sessions.unsuccessful.length + ")",
                            sessions: sessions.unsuccessful,
                            showing: sessions.unsuccessful.length,
                            onNodeTap:"sessionsTap"
                        }
                    ]
                });
            }
            nodes.push(node);
        }
        this.$.sessionTree.destroyClientControls();
        this.$.sessionTree.createComponents(nodes, {owner:this});
        this.$.sessionTree.render();
    }
});


