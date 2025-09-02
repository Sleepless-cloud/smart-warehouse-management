// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 POST /api/loginLog/list */
export async function listLoginLog(body: API.LoginLogQueryDTO, options?: { [key: string]: any }) {
  return request<API.PageLoginLogVO>('/api/loginLog/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
