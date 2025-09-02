// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

/** 此处后端没有提供注释 POST /api/transaction/checkIn */
export async function checkIn(body: API.TransactionDTO, options?: { [key: string]: any }) {
  return request<number>('/api/transaction/checkIn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/transaction/checkOut */
export async function checkOut(body: API.TransactionDTO, options?: { [key: string]: any }) {
  return request<number>('/api/transaction/checkOut', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/transaction/listTransaction */
export async function listTransaction(
  body: API.TransactionQueryDTO,
  options?: { [key: string]: any },
) {
  return request<API.PageTransactionVO>('/api/transaction/listTransaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
