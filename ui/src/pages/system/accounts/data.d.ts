
export interface TableItem {
  userId: number;
  disabled?: boolean;
  accountID?: number;
  avatar: string;
  firstName: string;
  lastName: string;
  code: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
  lastConnect?: Date;
  createdAt?: Date;
  password?: string;
  passwordConfirm?: string;
}

export interface TableListParams {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, unknown>;
  sorter?: Record<string, unknown>;
}

export interface User {
  userId?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  status: string;
  password: string;
  passwordConfirm: string;
  avatar: string;
}

export interface ShowForm {
  visible: boolean;
  action: 'ADD' | 'UPDATE';
  data?: TableItem;
}
export const emptyModel: User = {
  avatar: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  passwordConfirm: '',
  roles: [],
  status: 'ACTIVE',
  username: '',
};

export interface Privilege {
  adminMenuId: number;
  router: string;
  name: string;
  read: boolean;
  write: boolean;
}

export interface Role {
  roleId?: number;
  name: string;
  privileges: Privilege[];
  status: string;
}
