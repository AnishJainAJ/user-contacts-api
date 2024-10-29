const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel')

// @desc Get all contacts
// @route Get /api/contacts
// @access private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({user_id: req.user.id});
  res.status(200).json(contacts);
});

// @desc Get one contact
// @route Get /api/contacts/:id
// @access private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if(!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.status(200).json(contact);
});

// @desc create/add contact
// @route POST /api/contacts
// @access private
const createContact = asyncHandler(async (req, res) => {
  const {name, phone} = req.body;
  if(!name || !phone) {
    res.status(400);
    throw new Error('All fields are mandatory');
  }

  const contact = await Contact.create({name, phone, user_id: req.user.id});
  res.status(200).json(contact);
});

// @desc update contact
// @route PUT /api/contacts/:id
// @access public
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if(!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  if(contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('User dont have the permission to update other user contact');
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true}
  );
  res.status(200).json(updatedContact);
});

// @desc delete contact
// @route DELETE /api/contacts/:id
// @access public
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if(!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  if(contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('User dont have the permission to delete other user contact');
  }
  await Contact.deleteOne({_id: req.params.id});
  res.status(200).json(contact);
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
