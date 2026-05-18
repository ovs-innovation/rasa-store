const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../config/auth');

const {
  addLanguage,
  addAllLanguage,
  getAllLanguages,
  getShowingLanguage,
  getLanguageById,
  updateLanguage,
  updateStatus,
  deleteLanguage,
  updateManyLanguage,
  deleteManyLanguage,
} = require('../controller/languageController');

// add a language
router.post('/add', isAuth, isAdmin, addLanguage);

// add all language
router.post('/add/all', isAuth, isAdmin, addAllLanguage);

// get only showing language
router.get('/show', getShowingLanguage);

// get all language
router.get('/all', getAllLanguages);

// get a language
router.get('/:id', getLanguageById);

// update a language
router.put('/:id', isAuth, isAdmin, updateLanguage);

// update many language
router.patch('/update/many', isAuth, isAdmin, updateManyLanguage);

// show/hide a language
router.put('/status/:id', isAuth, isAdmin, updateStatus);

// delete a language
router.patch('/:id', isAuth, isAdmin, deleteLanguage);

//delete many language
router.patch('/delete/many', isAuth, isAdmin, deleteManyLanguage);

module.exports = router;
