Meteor role base access control
=========

Role based access control (RBAC)
--------------------------------

Role-Based Access Control (RBAC) provides a simple yet powerful centralized access control. Please refer to
the [Wikipedia](http://en.wikipedia.org/wiki/Role-based_access_control) for details about comparing RBAC
with other more traditional access control schemes.

This package has been inspired by yii2 implementation of RBAC. Please refer
[Yii2 security authorization](https://github.com/yiisoft/yii2/blob/master/docs/guide/security-authorization.md)
to get more details.

Using RBAC involves two parts of work. The first part is to build up the RBAC authorization data, and the second
part is to use the authorization data to perform access check in places where it is needed.

To facilitate our description next, we will first introduce some basic RBAC concepts.

Example of usage
--------------------------------

```javascript

    /*
        you have to save roles field to users collection so that
        Meteor.user() returns
        return {
            "_id": "54e45174cf36b30a26467890",
            // any other fields
            "roles": ["author", {more roles if needed}]
        }
    */

    // create lib/rbac.js and describe roles and rules
    // this is a small example. Review /tests/rbac-tests.js to see more examples.

    var rbac = new RbacManager({"defaultRoles": ['guest']});
    var authorRole = rbac.createRole("author");
    var adminRole = rbac.createRole("admin");

     var addArticle = rbac.createPermission("addArticle");
    // author can add article
    rbac.addChild(authorRole, addArticle);
    // now let's check that
    // test.isTrue(rbac.checkAccess("addArticle"));

    // create permission with rule callback
    var updateArticle = rbac.createPermission("updateArticle", function(user, article) {
        if (_.contains(user.roles, 'admin')) {
            return true;
        }

        return article.author_id == user._id
    });


    // author can update only its own article
    rbac.addChild(authorRole, updateArticle);
    // admin can do everything that author can
    rbac.addChild(adminRole, authorRole);

    var article = {
        "_id": "54e45174cf36b30a26445632",
        "author_id": "54e45174cf36b30a264e6724"
    };

    /** Assert meteor user returns
    Meteor.user = function() {
        return {
            "_id": "54e45174cf36b30a26467890",
            "roles": ["author"]
        }
    };
    */
    // test.isTrue(rbac.checkAccess("updateArticle", article));

```
