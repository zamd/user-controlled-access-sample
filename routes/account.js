const express = require('express'),
      router = express.Router();


function ensureScopesForAuthorizedAccess(scope) {
  return (req,res,next) => {
    if (!req.user.authorized_access) {
      return next();
    }
    const authorized_scopes = req.user.authorized_access.permissions.split(' ');
    if (!authorized_scopes.includes(scope))
      return next(new Error("Unauthorized"))
    next();

  }
}

const getDisplayName = user => {
  if (!user.authorized_access)
    return user.displayName;
  return user.authorized_access.owner_email;
} 

router.get('/bills', ensureScopesForAuthorizedAccess('manage:bills'), function(req, res, next) {
  res.render('account', { title: 'Bills management', user: getDisplayName(req.user) });
});

router.get('/usage', ensureScopesForAuthorizedAccess('manage:usage'), function(req, res, next) {
  res.render('account', { title: 'Account usage', user: getDisplayName(req.user) });
});

router.get('/plan', ensureScopesForAuthorizedAccess('manage:plan'), function(req, res, next) {
  res.render('account', { title: 'Plan management', user: getDisplayName(req.user) });
});

router.get('/upgrades', ensureScopesForAuthorizedAccess('manage:upgrades'), function(req, res, next) {
  res.render('account', { title: 'Upgrade management', user: getDisplayName(req.user) });
});

router.get('/devices', ensureScopesForAuthorizedAccess('manage:devices'), function(req, res, next) {
  res.render('account', { title: 'Devices management', user: getDisplayName(req.user) });
});

router.get('/settings', ensureScopesForAuthorizedAccess('manage:settings'), function(req, res, next) {
  res.render('account', { title: 'Account settings', user: getDisplayName(req.user) });
});

router.get('/broadband', ensureScopesForAuthorizedAccess('manage:broadband'), function(req, res, next) {
  res.render('account', { title: 'Broadband management', user: getDisplayName(req.user) });
});

module.exports = router;