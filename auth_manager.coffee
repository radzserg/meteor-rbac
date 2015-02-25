###
  Auth item (permission or role)
###
class Item

  constructor: (options = {}) ->
    @type = options.type || null
    @name = options.name || null
    @description = options.description || null
    @data = options.data || null


###
  User role auth item
###
class Role extends Item
  constructor: (options = {}) ->
    super(options)
    @type = RbacManager.TYPE_ROLE

###
  Access permission
###
class Permission extends Item
  constructor: (options = {}) ->
    super(options)
    @type = RbacManager.TYPE_PERMISSION
    @rule = options.rule || null

###
  Role base access control manager class
###
class @RbacManager
  @TYPE_ROLE = 1
  @TYPE_PERMISSION = 2


  constructor: (options = {}) ->
    @defaultRoles = options.defaultRoles || []
    @items = {}
    @children = {}

    @checkAccessRecursive = (user, permissionName, params, assignments) ->
      if !@items[permissionName]
        return false

      item = @items[permissionName]

      unless @executeRule(item, user, params)
        return false;

      if _.contains(assignments, permissionName) || _.contains(@defaultRoles, permissionName)
        return true

      self = @
      fn = @checkAccessRecursive
      result = false
      _.each @children, (children, parentName) ->
        if children[permissionName] && fn.call(self, user, parentName, params, assignments)
          result = true
      result

    @addItem = (item) ->
      @items[item.name] = item

    # execute rule for auth item
    @executeRule =  (item, user, params) ->
      if item instanceof Role
        return true
      if item.rule
        item.rule.call(@, user, params)
      else
        true

  # create new user role
  createRole: (roleName) ->
    role = new Role()
    role.name = roleName
    @addItem(role)
    role

  # create new permission
  createPermission: (permissionName, ruleCallback = null) ->
    permission = new Permission()
    permission.name = permissionName
    permission.rule = ruleCallback
    @addItem(permission)
    permission

  # add child item
  addChild: (parent, child) ->
    if !@items[parent.name] || !@items[child.name]
      throw new Error("Either #{parent.name} or #{child.name} does not exist.")

    if parent.name == child.name
      throw new Error("Cannot add #{parent.name} as a child of itself.")

    if parent instanceof Permission && child instanceof Role
      throw new Error("Cannot add a role as a child of a permission.")

    unless @children[parent.name]
      @children[parent.name] = {}
    @children[parent.name][child.name] = @items[child.name]

  # check access
  checkAccess: (permissionName, params) ->
    user = Meteor.user()
    assignments = []
    if user
      assignments = user.roles

    @checkAccessRecursive(user, permissionName, params, assignments)
