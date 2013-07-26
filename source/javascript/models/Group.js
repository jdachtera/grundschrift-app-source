$data.Entity.extend('Grundschrift.Models.Group', {
	id: {
		type: $data.Guid,
		key: true,
		computed: true
	},
	_lastChange: {
		type: 'int'
	},
	name: {
		type: String
	},
	description: {
		type: String
	}
});