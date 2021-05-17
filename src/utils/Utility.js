const getColor = (dotColor) => {
  if (dotColor === "color-yellow") {
    return "#E5E474";
  } else if (dotColor === "color-red") {
    return "#d41e4e";
  } else {
    return "#B6D882";
  }
};

export default {
  getColor,
};
