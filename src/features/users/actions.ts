// If your store already exports these, delete this file and import from there.
export const setCurrentUser = (user: any) => ({ type: "users/setCurrentUser", payload: user });
export const clearCurrentUser = () => ({ type: "users/clearCurrentUser" });
