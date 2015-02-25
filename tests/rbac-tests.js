// save original Meteor.user function
var meteorUser = Meteor.user;

Tinytest.add('Test create auth items', function (test) {
    var rbac = new RbacManager();

    var adminRole = rbac.createRole("admin");
    var userRole = rbac.createRole("user");

    test.isNotNull(rbac.items['admin']);
    test.isNotNull(rbac.items['admin']['type'], RbacManager.TYPE_ROLE);
    test.isNotNull(rbac.items['user']);
    test.isNotNull(rbac.items['user']['type'], RbacManager.TYPE_ROLE);

    var canAddComment = rbac.createPermission("canAddComment");
    test.isNotNull(rbac.items['canAddComment']);
    test.isNotNull(rbac.items['canAddComment']['type'], RbacManager.TYPE_ROLE);
});


Tinytest.add('Test add child items', function (test) {
    var rbac = new RbacManager();

    var adminRole = rbac.createRole("admin");
    var userRole = rbac.createRole("user");

    rbac.addChild(adminRole, userRole);

    test.isNotNull(rbac.children['admin']['user']);
});


Tinytest.add('Test default role', function (test) {
    Meteor.user = function() {
        return {
            "_id": "54e45174cf36b30a264e6724",
            "roles": []
        }
    };
    var rbac = new RbacManager({"defaultRoles": ['guest']});
    var guestRole = rbac.createRole("guest");
    test.isTrue(rbac.checkAccess("guest"));
}, function() {
    Meteor.user = meteorUser;
});

Tinytest.add('Test checkAccess', function (test) {
    Meteor.user = function() {
        return {
            "_id": "54e45174cf36b30a264e6724",
            "roles": ["author"]
        }
    };
    var rbac = new RbacManager({"defaultRoles": ['guest']});
    var authorRole = rbac.createRole("author");
    var addArticle = rbac.createPermission("addArticle");

    // author can add article
    rbac.addChild(authorRole, addArticle);
    // now let's check that
    test.isTrue(rbac.checkAccess("addArticle"));
}, function() {
    Meteor.user = meteorUser;
});

Tinytest.add('Test checkAccess with params', function (test) {
    var rbac = new RbacManager({"defaultRoles": ['guest']});
    var authorRole = rbac.createRole("author");
    var adminRole = rbac.createRole("admin");
    var updateArticle = rbac.createPermission("updateArticle", function(user, article) {
        if (_.contains(user.roles, 'admin')) {
            return true;
        }

        return article.author_id == user._id
    });


    // author can update article
    rbac.addChild(authorRole, updateArticle);
    // admin can do everything that author can
    rbac.addChild(adminRole, authorRole);

    var article = {
        "_id": "54e45174cf36b30a26445632",
        "author_id": "54e45174cf36b30a264e6724"
    };

    // test author and not his article
    Meteor.user = function() {
        return {
            "_id": "54e45174cf36b30a26467890",
            "roles": ["author"]
        }
    };
    test.isFalse(rbac.checkAccess("updateArticle", article));

    // test author and his article
    Meteor.user = function() {
        return {
            "_id": "54e45174cf36b30a264e6724",
            "roles": ["author"]
        }
    };
    test.isTrue(rbac.checkAccess("updateArticle", article));

    // test admin
    Meteor.user = function() {
        return {
            "_id": "12345174cf36b30a264e6724",
            "roles": ["admin"]
        }
    };
    test.isTrue(rbac.checkAccess("updateArticle", article));
}, function() {
    Meteor.user = meteorUser;
});