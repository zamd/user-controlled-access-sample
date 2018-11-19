function (user, context, callback) {
  var _ =require('lodash@4.8.2');
 var requestedScopes = context.request.query && context.request.query.scope.split(' ') || [];
  var targetScope = requestedScopes.find(s=>s.indexOf('user_controlled_access')!==-1);
  if (targetScope) {
    //TODO: validate/verify authorized_access depending on application's domain.
    var onwerId = targetScope.split('/')[1];
    var ag = user.app_metadata.access_grants.find(ag=>ag.owner_id===onwerId);
    context.idToken["http://user.controlled.access/authorized_access"] = ag;
  }
 callback(null, user, context);
}