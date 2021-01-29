const express = require('express');

const router = express.Router();

// TODO: Serve a documentation page
/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Edu Crib' });
});

module.exports = router;
