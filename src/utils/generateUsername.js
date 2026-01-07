// import User from "../models/User.js";

// export const generateUniqueUsername = async (base) => {
//   let username = base;
//   let exists = await User.exists({ username });

//   while (exists) {
//     const random = Math.floor(1000 + Math.random() * 9000);
//     username = `${base}_${random}`;
//     exists = await User.exists({ username });
//   }

//   return username;
// };
import User from "../models/User.js";

export const generateUniqueUsername = async (base) => {
  let username = base;
  let exists = await User.exists({ username });

  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000);
    username = `${base}_${random}`;
    exists = await User.exists({ username });
  }

  return username;
};
