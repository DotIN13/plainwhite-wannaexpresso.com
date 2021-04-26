export default () => {
  const now = new Date();
  now.setDate(now.getDate() - now.getDay());
  return now.toDateString();
}