Grundschrift.Models.ZippedJson.extend('Grundschrift.Models.LevelData', {});


Grundschrift.Models.LevelData.create = function(data, context, callback) {
	var z = new Grundschrift.Models.LevelData()
	z.zip(data);
	z.save().then(function() {
		enyo.asyncMethod(context, callback, z);
	});
};

Grundschrift.Models.LevelData.update = function(id, data, context, callback) {
	Grundschrift.Models.db.levelData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				var z = items[0];
			} else {
				var z = new Grundschrift.Models.LevelData({id: id});
			}
			z.zip(data);
			z.save().then(function() {
				enyo.asyncMethod(context, callback, z);
			});
		});
};

Grundschrift.Models.LevelData.find = function(id, context, callback) {
	Grundschrift.Models.db.levelData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				var z = items[0];
				enyo.asyncMethod(context, callback, z.unzip());
			} else {
				enyo.asyncMethod(context, callback, []);
			}
		});
};

Grundschrift.Models.LevelData.remove = function(id, context, callback) {
	Grundschrift.Models.db.sessionData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				items[0].remove().then(enyo.bind(context, callback));
			}
		});
};