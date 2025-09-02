declare namespace API {
  type AdminDTO = {
    id?: number;
    userCode?: string;
    name?: string;
    sex?: number;
    enabled?: boolean;
    password?: string;
    department?: string;
    phone?: string;
    email?: string;
    modList?: AdminModDTO[];
  };

  type AdminModDTO = {
    id?: string;
    privList?: string[];
  };

  type AdminVO = {
    id?: number;
    userCode?: string;
    name?: string;
    sex?: number;
    enabled?: boolean;
    password?: string;
    department?: string;
    phone?: string;
    email?: string;
    createdAt?: string;
    createdBy?: number;
    createdByDesc?: string;
    updatedAt?: string;
    updatedBy?: number;
    updatedByDesc?: string;
  };

  type DepartmentDTO = {
    id?: number;
    departmentName?: string;
    contact?: string;
    contactPhone?: string;
    description?: string;
  };

  type DepartmentQueryDTO = {
    current?: number;
    pageSize?: number;
    departmentName?: string;
  };

  type DepartmentVO = {
    id?: number;
    departmentName?: string;
    contact?: string;
    contactPhone?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
    createdByDesc?: string;
  };

  type getAdminParams = {
    id: number;
  };

  type getDepartmentParams = {
    id: number;
  };

  type getItemParams = {
    id: number;
  };

  type ItemDTO = {
    id?: number;
    name: string;
    code: string;
    unit: string;
    specification: string;
    quantity?: number;
    threshold: number;
  };

  type ItemQueryDTO = {
    pageSize?: number;
    current?: number;
    name?: string;
    code?: string;
    orderBy?: string;
  };

  type ItemVO = {
    id: number;
    name: string;
    itemNumber: string;
    unit: string;
    specification: string;
    stockQuantity?: number;
    threshold: number;
    created_at?: string;
    updated_at?: string;
    operatorName?: string;
    updatedByDesc?: string;
  };

  type KeywordQueryDTO = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
  };

  type kickParams = {
    readerToken: string;
  };

  type LoginLogQueryDTO = {
    current?: number;
    pageSize?: number;
    userCode?: string;
    ipAddress?: string;
    createdAt?: string;
    orderBy?: string;
  };

  type LoginLogVO = {
    id?: number;
    userCode?: string;
    ipAddress?: string;
    name?: string;
    os?: string;
    browser?: string;
    createdAt?: string;
  };

  type loginParams = {
    userId: string;
    password: string;
  };

  type ModuleVO = {
    id?: string;
    privilegeList?: PrivilegeVO[];
  };

  type OnlineUserVO = {
    accessToken?: string;
    backend?: boolean;
    userName?: string;
    userCode?: string;
    userId?: number;
    roleId?: number;
    roleName?: string;
    lastAction?: string;
    sex?: string;
    department?: string;
    ipAddr?: string;
    os?: string;
    browser?: string;
    browserVersion?: string;
    device?: string;
    country?: string;
    location?: string;
    isp?: string;
    totalNetFlow?: number;
    referer?: string;
  };

  type PageAdminVO = {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: AdminVO[];
  };

  type PageDepartmentVO = {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: DepartmentVO[];
  };

  type PageItemVO = {
    data: ItemVO[];
    total: number;
    success: boolean;
    list?: ItemVO[];
  };

  type PageLoginLogVO = {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: LoginLogVO[];
  };

  type PageTransactionVO = {
    data: TransactionVO[];
    total: number;
    success: boolean;
    list?: TransactionVO[];
  };

  type PrivilegeVO = {
    id?: string;
    description?: string;
  };

  type Token = {
    accessToken?: string;
    userName?: string;
    userCode?: string;
    browser?: string;
    os?: string;
    device?: string;
    userId?: number;
    sex?: number;
    department?: string;
    ipAddress?: string;
    privSet?: string[];
    lastAction?: string;
  };

  type TransactionDTO = {
    id?: number;
    itemId: number;
    quantity: number;
    operator?: string;
    handlerId?: number;
    handlerName?: string;
    remark?: string;
    type?: 'IN' | 'OUT' | 'in' | 'out';
  };

  type TransactionQueryDTO = {
    pageSize?: number;
    current?: number;
    itemCode?: string;
    itemName?: string;
    operator?: string;
    type?: string;
    orderBy?: string;
    startDate?: string;
    endDate?: string;
  };

  type TransactionVO = {
    id: number;
    itemId: number;
    itemNumber?: string;
    itemName?: string;
    unit?: string;
    specification?: string;
    operationType?: string;
    quantity?: number;
    postStock?: number;
    handlerName?: string;
    remark?: string;
    operationTime?: string;
  };
}
