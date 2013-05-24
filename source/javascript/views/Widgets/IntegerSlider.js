/**
 * A Slider for integers with a display for the value.
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 * @class
 */
enyo.kind({
    kind:'Control',
    name:'Grundschrift.Views.IntegerSlider',
    published:{
        /**
         * The current value
         */
        value:0,
        /**
         * The minimum value
         */
        min:0,
        /**
         * The maximum value
         */
        max:9,
        /**
         * Set to true to disble user interaction
         */
        disabled:false,
        /**
         * The caption of the slider
         * */
        caption:'',

        /**
         * The default step of 1 can be changed
         */
        step:1
    },
    noStretch:true,
    style:'margin: 10px 0px;',
    events:{
        /**
         * Is called when the value is changed
         */
        onChange:''
    },
    components:[

        {kind:'FittableColumns', style:'margin-bottom: 10px;height: 32px', components:[
            {name:'caption', style:'font-weight:bold;line-height:32px;', fit:true},
            {kind:'onyx.Button', content:'-', ontap:'decrement', style:'width:47px'},
            {kind:'Control', name:'display', style:'width:50px;line-height:32px;text-align:center'},
            {kind:'onyx.Button', content:'+', ontap:'increment', style:'width:47px'}
        ]},
        {kind:'onyx.Slider', onChange:'sliderChanged', onChanging:'sliderChanged', style:'margin-bottom:20px', fit:true}

    ],

    /**
     * Called when the integer slider is created.
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);
        this.minChanged();
        this.maxChanged();
        this.captionChanged();
    },


    rendered:function () {
        this.resized();
    },

    /**
     * Sets the caption
     **/
    captionChanged:function () {
        this.$.caption.setContent(this.caption);
    },

    /**
     * Sets the slider position on a value change.
     * @protected
     * @returns void
     */
    valueChanged:function () {
        var length = this.max - this.min;
        this.value = this.value > this.max ? this.max : (this.value < this.min ? this.min : this.value);
        this.$.slider.setValue((this.value - this.min) / length * 100);
        this.$.display.setContent(this.value);
    },

    /**
     * Sets the value when the slider is moved. Rounds the value.
     * @protected
     * @returns void
     */
    sliderChanged:function () {
        var length = this.max - this.min;
        this.setValue(Math.round((this.$.slider.getValue() / 100 * length + this.min) / this.step) * this.step);
        this.doChange();
    },

    /**
     * Sets the min value
     * @protected
     * @returns void
     */
    minChanged:function () {
        if (this.max <= this.min) {
            this.max = this.min + 1;
        }

        this.valueChanged();
    },

    /**
     * Sets the max value
     * @protected
     * @returns void
     */
    maxChanged:function () {
        if (this.max <= this.min) {
            this.max = this.min + 1;
        }
        this.valueChanged();
    },

    increment:function () {
        this.value += this.step;
        this.valueChanged();
        this.doChange();
    },

    decrement:function () {
        this.value -= this.step;
        this.valueChanged();
        this.doChange();
    }
});