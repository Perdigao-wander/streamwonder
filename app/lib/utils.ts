import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove tags HTML e formata o texto corretamente
 */
export const cleanHtmlText = (html: string): string => {
  if (!html) return '';

  // Remove tags HTML
  let text = html.replace(/<[^>]*>/g, '');

  // Decodifica entidades HTML comuns
  text = text.replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&eacute;/g, 'é')
      .replace(/&aacute;/g, 'á')
      .replace(/&iacute;/g, 'í')
      .replace(/&oacute;/g, 'ó')
      .replace(/&uacute;/g, 'ú')
      .replace(/&ntilde;/g, 'ã')
      .replace(/&ccedil;/g, 'ç');

  // Remove espaços extras e quebras de linha
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

/**
 * Extrai texto puro de HTML (mantém formatação básica)
 */
export const extractPlainText = (html: string): string => {
  if (!html) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Renderiza HTML de forma segura (apenas para descrições)
 */
export const renderSafeHTML = (html: string): { __html: string } => {
  if (!html) return { __html: '' };

  // Remove scripts e iframes perigosos
  const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  return { __html: cleanHtml };
};