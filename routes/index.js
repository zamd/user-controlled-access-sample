const express = require('express'),
      router = express.Router();

router.get('/', function(req, res) {
  const authorized_access = req.user.authorized_access;
  const access_grants = (req.user.user_controlled_access || {}).access_grants || undefined;

  const vm = {
    displayName: req.user.displayName,
    access_grants,
    authorized_access,
    accessAllowed: scope => {
      if (!authorized_access)
        return true;
      const authorizedPermissions = authorized_access.permissions.split(' ');
      return authorizedPermissions.includes(scope);
    }
  };
  
  res.render('index', { title: 'User controlled access sample', vm});
});

module.exports = router;
