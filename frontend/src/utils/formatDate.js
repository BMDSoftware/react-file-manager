export const formatDate = (date, type = "string") => {
  if (!date || isNaN(Date.parse(date))) return "";

  date = new Date(date);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const strDate = `${month}/${day}/${year}`;
  const strTime = `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;

  switch (type) {
    case "string":
      return `${strDate} ${strTime}`;
    case "date-time":
      return [strDate, strTime];
    default:
      throw new Error(`Unsupported format type: ${type}`);
  }
};
