/**
 * Migrations are used to update the database schema for different application versions
 * @type {Array}
 */
Grundschrift.Models.Migrations = [
    [1, {
        up:function () {

            this.action(enyo.bind(this, function (tx, nextCommand) {
                tx.executeSql("SELECT sql FROM sqlite_master WHERE type='table' AND name='Session'", [], enyo.bind(this, function (schema) {
                    if (schema[0].sql.split('success').length == 1) {
                        tx.executeSql('ALTER TABLE Session ADD success BOOL', [], enyo.bind(this, function () {
                            tx.executeSql('UPDATE Session SET success=1', [], enyo.bind(this, function () {
                                nextCommand();
                            }));
                        }));
                    } else {
                        nextCommand();
                    }
                }));
            }));

            this.action(enyo.bind(this, function (tx, nextCommand) {
                tx.executeSql("SELECT sql FROM sqlite_master WHERE type='table' AND name='Child'", [], enyo.bind(this, function (schema) {
                    console.log('2');
                    if (schema[0].sql.split('leftHand').length == 1) {
                        tx.executeSql('ALTER TABLE Child ADD leftHand BOOL', [], enyo.bind(this, function () {
                            nextCommand();
                        }));
                    } else {
                        nextCommand();
                    }
                }));
            }));


            this.action(function (tx, nextCommand) {
                Grundschrift.Models.Level.checkUpdates(nextCommand);
            });

        },
        down:function () {

        }
    }],
    [2, {
        up:function () {
            this.action(function (tx, nextCommand) {
                Grundschrift.Models.Level.checkUpdates(nextCommand);
            });
        },
        down:function () {

        }
    }]
];
