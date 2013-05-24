Grundschrift.Models.Child = persistence.define('Child', {
    name:'TEXT',
    password:'JSON',
    imageUrl:'TEXT',
    leftHand:'BOOL'
});
Grundschrift.Models.Child.hasMany('sessions', Grundschrift.Models.Session, 'child');
Grundschrift.Models.Child.enableSync(Grundschrift.Models.syncServer + '/childChanges');