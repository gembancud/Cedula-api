import { verify } from "hcaptcha";

export const hcaptchaVerify = async (token: string): Promise<boolean> => {
  const res = await verify(process.env.RECAPTCHA_SECRET_KEY!, token);
  return res.success;
};
