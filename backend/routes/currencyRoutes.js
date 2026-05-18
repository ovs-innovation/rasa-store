const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../config/auth');

const {
  addCurrency,
  addAllCurrency,
  getAllCurrency,
  getShowingCurrency,
  getCurrencyById,
  updateCurrency,
  updateManyCurrency,
  updateEnabledStatus,
  updateLiveExchangeRateStatus,
  deleteCurrency,
  deleteManyCurrency,
} = require('../controller/currencyController');

//add a addCurrency
router.post('/add', isAuth, isAdmin, addCurrency);

//add all Currency
router.post('/add/all', isAuth, isAdmin, addAllCurrency);

//get only showing Currency
router.get('/show', getShowingCurrency);

//get all Currency
router.get('/', getAllCurrency);

//get a Currency
router.get('/:id', getCurrencyById);

//update a Currency
router.put('/:id', isAuth, isAdmin, updateCurrency);

// update many Currency
router.patch('/update/many', isAuth, isAdmin, updateManyCurrency);

//delete many product
router.patch('/delete/many', isAuth, isAdmin, deleteManyCurrency);

//delete a Currency
router.delete('/:id', isAuth, isAdmin, deleteCurrency);

// show/hide a Currency
router.put('/status/enabled/:id', isAuth, isAdmin, updateEnabledStatus);

// show/hide a Currency
router.put('/status/live-exchange-rates/:id', isAuth, isAdmin, updateLiveExchangeRateStatus);

module.exports = router;
