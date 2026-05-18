const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../config/auth');

const {
  addAttribute,
  addAllAttributes,
  getAllAttributes,
  getShowingAttributes,
  getAttributeById,
  updateAttributes,
  updateStatus,
  deleteAttribute,
  getShowingAttributesTest,
  updateChildStatus,
  deleteChildAttribute,
  addChildAttributes,
  updateChildAttributes,
  getChildAttributeById,
  updateManyAttribute,
  deleteManyAttribute,
  updateManyChildAttribute,
  deleteManyChildAttribute,
} = require('../controller/attributeController');

//add attribute
router.post('/add', isAuth, isAdmin, addAttribute);

//add all attributes
router.post('/add/all', isAuth, isAdmin, addAllAttributes);

// add child attribute
router.put('/add/child/:id', isAuth, isAdmin, addChildAttributes);

//get all attribute
router.get('/', getAllAttributes);

// router.get('/show', getShowingProducts);
router.get('/show', getShowingAttributes);

router.put('/show/test', isAuth, isAdmin, getShowingAttributesTest);

// update many attributes
router.patch('/update/many', isAuth, isAdmin, updateManyAttribute);

//get attribute by id
router.get('/:id', getAttributeById);

// child get attributes by id
router.get('/child/:id/:ids', getChildAttributeById);

//update attribute
router.put('/:id', isAuth, isAdmin, updateAttributes);

// update child attribute
router.patch('/update/child/many', isAuth, isAdmin, updateManyChildAttribute);

// update child attribute
router.put('/update/child/:attributeId/:childId', isAuth, isAdmin, updateChildAttributes);

//show/hide a attribute
router.put('/status/:id', isAuth, isAdmin, updateStatus);

// show and hide a child status
router.put('/status/child/:id', isAuth, isAdmin, updateChildStatus);

//delete attribute
router.delete('/:id', isAuth, isAdmin, deleteAttribute);

// delete child attribute
router.put('/delete/child/:attributeId/:childId', isAuth, isAdmin, deleteChildAttribute);

// delete many attribute
router.patch('/delete/many', isAuth, isAdmin, deleteManyAttribute);

// delete many child attribute
router.patch('/delete/child/many', isAuth, isAdmin, deleteManyChildAttribute);

module.exports = router;
