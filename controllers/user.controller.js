const readAll = (req, res) => {

  res.status(200).json({
    "message": "All Users retrieved"
  });
};

const readOne = (req, res) => {
  let id = req.params.id;

  res.status(200).json({
    "message": `User with id: ${id} retrieved`
  });
};

const createData = (req, res) => {
  console.log(req.body);
  let data = req.body;

  if (data.password.length < 6) {
    return res.status(422).json({
      "message": "User password must be over 6 characters",
    });
  }

  data.password = undefined;

  return res.status(201).json({
    "message": "All good",
    data
  });
};

const updateData = (req, res) => {
  let id = req.params.id;
  let data = req.body;

  data.id = id;

  res.status(200).json({
    "message": `You updated user with id: ${id}`,
    data
  });

};

const deleteData = (req, res) => {
  let id = req.params.id;

  res.status(200).json({
    "message": `You deleted user with id: ${id}`
  });
};

module.exports = {
  readAll,
  readOne,
  createData,
  updateData,
  deleteData
};