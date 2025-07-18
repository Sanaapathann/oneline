export const getOrCreateUserId = () => {
  let id = localStorage.getItem('oneline_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('oneline_user_id', id);
  }
  return id;
};
