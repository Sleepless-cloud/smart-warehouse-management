// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 POST /api/department/addDepartment */
export async function addDepartment(body: API.DepartmentDTO, options?: { [key: string]: any }) {
  return request<number>('/api/department/addDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/department/deleteDepartment */
export async function deleteDepartment(body: number[], options?: { [key: string]: any }) {
  return request<any>('/api/department/deleteDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/department/exportDepartment */
export async function exportDepartment(
  body: API.DepartmentQueryDTO,
  options?: { [key: string]: any },
) {
  return request<any>('/api/department/exportDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/department/getDepartment */
export async function getDepartment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDepartmentParams,
  options?: { [key: string]: any },
) {
  return request<API.DepartmentDTO>('/api/department/getDepartment', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/department/importDepartment */
export async function importUsers(body: {}, options?: { [key: string]: any }) {
  return request<number>('/api/department/importDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/department/listDepartment */
export async function listDepartment(
  body: API.DepartmentQueryDTO,
  options?: { [key: string]: any },
) {
  return request<API.PageDepartmentVO>('/api/department/listDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/department/updateDepartment */
export async function updateDepartment(body: API.DepartmentDTO, options?: { [key: string]: any }) {
  return request<number>('/api/department/updateDepartment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
