import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const WAREZCDN_API: string = process.env.NEXT_PUBLIC_WAREZCDN_API ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_WAREZCDN_API não definida no .env");
})();

export const TMDB_BASE_URL: string = process.env.NEXT_PUBLIC_SERVER_API_URL ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_SERVER_API_URL não definida no .env");
})();

export const TMDB_TOKEN: string = process.env.NEXT_PUBLIC_API_TOKEN ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_API_TOKEN não definida no .env");
})();

export const API_KEY: string = process.env.NEXT_PUBLIC_API_KEY ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_API_KEY não definida no .env");
})();

export const COMIC_VINE_API_KEY: string = process.env.NEXT_PUBLIC_COMIC_VINE_API_KEY ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_COMIC_VINE_API_KEY não definida no .env");
})();

export const COMIC_VINE_API_URL: string = process.env.NEXT_PUBLIC_COMIC_VINE_API_URL ?? (() => {
  throw new Error("❌ NEXT_PUBLIC_COMIC_VINE_API_URL não definida no .env");
})();

export const HOOMAN_CAPTCHA_KEY: string = process.env.HOOMAN_CAPTCHA_KEY ?? (() => {
  throw new Error("❌ HOOMAN_CAPTCHA_KEY não definida no .env");
})();

export const HOOMAN_RUCAPTCHA: string = process.env.HOOMAN_RUCAPTCHA ?? (() => {
  throw new Error("❌ HOOMAN_RUCAPTCHA não definida no .env");
})();

export const PROXY_URL: string = process.env.PROXY_URL ?? (() => {
  throw new Error("❌ PROXY_URL não definida no .env");
})();