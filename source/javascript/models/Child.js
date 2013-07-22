$data.Entity.extend('Grundschrift.Models.User', {
	id: {
		type: 'int',
		key: true,
		computed: true
	},
	name: {
		type: String,
		required: true,
	},
	password: {
		type: Array,
		elementType: 'int'
	},
	leftHand: {
		type: Boolean
	}
});


