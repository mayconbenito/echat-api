const Users = require("../models/users");

module.exports = {
  index: async (req, res) => {
    try {
      let { page, limit } = req.query;
      limit = parseInt(limit || 10);

      const { contacts } = await Users.findById(req.userId)
        .populate("contacts")
        .select("-_id +contacts")
        .skip(limit * (page - 1))
        .limit(limit);

      contacts.map(contact => {
        contact.contacts = undefined;
        contact.session = undefined;
        return contact;
      });

      const totalItems = await Users.countDocuments({ _id: req.userId });

      const metadata = {
        totalItems: totalItems,
        items: contacts.length,
        pages: Math.ceil(totalItems / limit)
      };

      return res.json({
        metadata,
        users: contacts
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
    }
  },
  store: async (req, res) => {
    try {
      const { id } = req.params;

      const verifyFriend = await Users.findById(id);
      if (!verifyFriend) {
        return res.status(404).json({ code: "USER_NOT_FOUND" });
      }

      const verifyContact = await Users.findOne({
        _id: req.userId,
        contacts: id
      });

      if (verifyContact) {
        return res.status(400).json({ code: "CONTACT_ALREADY_ADDED" });
      }

      const addContact = await Users.findOneAndUpdate(
        { _id: req.userId },
        { $push: { contacts: id } }
      );

      if (addContact) {
        return res.status(204).send();
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
    }
  }
};
