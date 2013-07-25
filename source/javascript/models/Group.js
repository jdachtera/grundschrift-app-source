$data.Entity.extend('Grundschrift.Models.Group', {
	id: {
		type: $data.Guid,
		key: true,
		computed: true
	},
	name: {
		type: String
	},
	description: {
		type: String
	}
});