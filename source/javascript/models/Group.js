Grundschrift.Models.Group = persistence.define('Group', {
	name: 'TEXT',
	description: 'TEXT'
});
Grundschrift.Models.Group.hasMany('children', Grundschrift.Models.Child, 'group');

