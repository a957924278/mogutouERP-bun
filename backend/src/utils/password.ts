const saltRounds = 10; // 加密强度
export const hashPassword = async (password: string): Promise<string> => {
  return Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: saltRounds,
  });
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return Bun.password.verify(password, hash);
};
