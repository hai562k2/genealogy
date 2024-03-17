import { AppConstant } from './app.constant';

export const getValueOrDefault = <T>(value: any, defaultValue: T): T => {
  return value !== null && value !== undefined ? (value as T) : defaultValue;
};

export const toFullName = (socialData: any) => {
  const { firstName, lastName } = socialData || {};
  const fullName = [firstName, lastName].filter(Boolean).join('');
  return fullName.trim();
};

export const isNotEmptyField = (value: any, isNumber = false) => {
  if (isNumber) {
    return value !== null && value !== undefined && value > 0;
  }

  return value !== null && value !== undefined && value.length > 0;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const formatDateYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
};

export const getInformationDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {
    year,
    month,
    day,
  };
};

export const getTitle = (content: string): string => {
  const normalizedContent = content.replace(/\r\n|\r/g, '\n').trim();
  const nonEmptyLines = normalizedContent.split('\n').filter((line) => line.trim() !== '');
  const paragraph = nonEmptyLines[0] ?? '';

  const regex = new RegExp(AppConstant.SPLIT_CHARACTERS);
  const match = regex.exec(paragraph);

  const title = paragraph.slice(0, getValueOrDefault(match?.index, paragraph.length) + 1);
  return title;
};
