// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 POST /api/admin/add */
export async function addAdmin(body: API.AdminDTO, options?: { [key: string]: any }) {
  return request<number>('/api/admin/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/admin/delete */
export async function deleteAdmin(body: number[], options?: { [key: string]: any }) {
  return request<number>('/api/admin/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/admin/get */
export async function getAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAdminParams,
  options?: { [key: string]: any },
) {
  return request<API.AdminDTO>('/api/admin/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/admin/list */
export async function listAdmin(body: API.KeywordQueryDTO, options?: { [key: string]: any }) {
  return request<API.PageAdminVO>('/api/admin/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/admin/listModules */
export async function listModules(options?: { [key: string]: any }) {
  return request<API.ModuleVO[]>('/api/admin/listModules', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/admin/update */
export async function updateAdmin(body: API.AdminDTO, options?: { [key: string]: any }) {
  return request<number>('/api/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
