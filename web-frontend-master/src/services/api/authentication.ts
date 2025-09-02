// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 GET /api/authentication/getCurrentUser */
export async function getCurrentUser(options?: { [key: string]: any }) {
  return request<API.Token>('/api/authentication/getCurrentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/authentication/login */
export async function login(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.loginParams,
  options?: { [key: string]: any },
) {
  return request<API.Token>('/api/authentication/login', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/authentication/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<any>('/api/authentication/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/authentication/ping */
export async function ping(options?: { [key: string]: any }) {
  return request<any>('/api/authentication/ping', {
    method: 'GET',
    ...(options || {}),
  });
}
