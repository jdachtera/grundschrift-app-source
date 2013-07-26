$data.Entity.extend('Grundschrift.Models.User', {
	id: {
		type: $data.Guid,
		key: true,
		computed: true
	},
	_lastChange: {
		type: 'int'
	},
	gender: {
		type: String
	},
	name: {
		type: String
	},
	password: {
		type: Array,
		elementType: 'int'
	},
	leftHand: {
		type: Boolean
	},
	groupId: {
		type: String
	}
});

Grundschrift.Models.User.export = function(context, callback) {
	var data = [];
	Grundschrift.Models.db.users.toArray(function(users) {
		function next() {
			if (users.length) {
				var user = users.shift();
				data.push({
					id: user.id,
					name: user.name,
					leftHand: user.leftHand,
					password: user.password,
					groupId: user.groupId
				});
				next();
			} else {
				enyo.asyncMethod(context, callback, data);
			}
		}
		next();
	});
};


