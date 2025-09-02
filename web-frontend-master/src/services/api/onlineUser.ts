// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 GET /api/onlineUser/kick */
export async function kick(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.kickParams,
  options?: { [key: string]: any },
) {
  return request<any>('/api/onlineUser/kick', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/onlineUser/list */
export async function listOnlineUser(options?: { [key: string]: any }) {
  return request<API.OnlineUserVO[]>('/api/onlineUser/list', {
    method: 'GET',
    ...(options || {}),
  });
}
