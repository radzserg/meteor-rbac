
UI.registerHelper('checkAccess', function(permission, params) {
    var res;
    if (params == null) {
        params = {};
    }
    res = rbac.checkAccess(permission, params);
    return res;
});
