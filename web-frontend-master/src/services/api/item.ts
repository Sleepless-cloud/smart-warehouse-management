// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

// 定义通用的请求选项类型（如果 request 工具支持）
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
  data?: any; // POST/PUT 数据
  params?: any; // GET/DELETE URL 参数
}

/** 此处后端没有提供注释 POST /api/item/addItem */
export async function addItem(body: API.ItemDTO, options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: body,
    ...(options || {}),
  };
  return request<number>('/api/item/addItem', requestOptions);
}

/** 此处后端没有提供注释 POST /api/item/deleteItem */
export async function deleteItem(body: number[], options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: body,
    ...(options || {}),
  };
  return request<boolean>('/api/item/deleteItem', requestOptions);
}

/** 此处后端没有提供注释 GET /api/item/getItem */
export async function getItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getItemParams,
  options?: { [key: string]: any },
) {
  return request<API.ItemDTO>('/api/item/getItem', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/item/listItem */
export async function listItem(body: API.ItemQueryDTO, options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: body,
    ...(options || {}),
  };
  return request<API.PageItemVO>('/api/item/listItem', requestOptions);
}

/** 此处后端没有提供注释 POST /api/item/updateItem */
export async function updateItem(body: API.ItemDTO, options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: body,
    ...(options || {}),
  };
  return request<number>('/api/item/updateItem', requestOptions);
}

// New function to call the backend AI parser
export async function parseAndAddItemsViaAI(input: string, options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: { input },
    ...(options || {}),
  };
  return request<{ success: boolean; message: string; addedCount: number; failedCount: number }>(
    '/api/ai/parseAndAddItems',
    requestOptions
  );
}

/** 此处后端没有提供注释 POST /api/item/exportItem */
export async function exportItem(body: API.ItemQueryDTO, options?: { [key: string]: any }) {
  const requestOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    data: body,
    ...(options || {}),
  };
  return request<any>('/api/item/exportItem', requestOptions);
}
