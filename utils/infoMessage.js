const createMessage = (title, data) => {
  return {
    message: `${title} was created`,
    data: data,
  };
};

const editMessage = (title, data) => {
  return {
    message: `${title} was updated`,
    data: data,
  };
};

const deleteMessage = (title, data) => {
  return {
    message: `${title} was deleted`,
    data: data,
  };
};

const errorMessage = (message, error) => {
  return {
    message: message,
    error: error,
  };
};

module.exports = { createMessage, editMessage, deleteMessage, errorMessage };
