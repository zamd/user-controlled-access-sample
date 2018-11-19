const express = require('express'),
      router = express.Router(),
      passport = require('passport');
      
const api = require('../lib/apiClient');

router.get('/', function(req, res) {
  res.render('access', { title: 'Manage access' });
});

router.get('/switch', function(req, res, next) {
  const userId = req.query.ro;
  const permissions = req.query.permissions;
  return passport.authenticate('auth0',{scope: `openid profile user_controlled_access/${userId}`})(req,res,next);
});


//TODO: add CSRF token
router.post('/', async function(req, res) {
  const access_request = req.body;

  if (access_request.email) {
    try {
      await api.createAccess(access_request, req.user);
      res.redirect(`access/summary`)
    } catch(err) {
      console.log(err);
      res.redirect('access');
    }
  }
});

router.get('/summary', async function(req, res) {
  const userControlledAccess = await api.getAppMetadataByEmail(req.user.email);
  const vm = {
    shared_access: userControlledAccess.shared_access,
    user: req.user.email
  }
  res.render('access-summary',{title: "Sharing summary", vm})
});


module.exports = router;