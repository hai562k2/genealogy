import { AppConstant } from './app.constant';

export const getValueOrDefault = <T>(value: any, defaultValue: T): T => {
  return value !== null && value !== undefined ? (value as T) : defaultValue;
};

export const isOwner = (roleCd?: number | null) => {
  return !!(roleCd && [AppConstant.ROLE_OWNER].includes(roleCd));
};
export const isAdminOrOwner = (roleCd?: number | null) => {
  return !!(roleCd && [AppConstant.ROLE_OWNER, AppConstant.ROLE_ADMIN].includes(roleCd));
};
export const isMember = (roleCd?: number | null) => {
  return !!(roleCd && [AppConstant.ROLE_OWNER, AppConstant.ROLE_ADMIN, AppConstant.ROLE_LABORER].includes(roleCd));
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
