// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/request';

// 定义所需的类型
declare namespace API {
  // 从 typings.d.ts 复制 ItemVO 定义
  type ItemVO = {
    id: number;
    name: string;
    itemNumber: string;
    unit: string;
    specification: string;
    stockQuantity?: number;
    threshold: number;
    created_at?: string; // 注意后端返回字段名可能不一致，前端已适配
    updated_at?: string; // 注意后端返回字段名可能不一致，前端已适配
    operatorName?: string;
    updatedByDesc?: string; // 这个字段似乎在VO中，但可能不常用
  };

  type DashboardSummaryVO = {
    totalItemCount?: number;
    totalStockQuantity?: number;
    lowStockItemCount?: number;
    todayTransactionCount?: number;
    topItemsByStock?: { name: string; quantity: number }[];
    recentTransactionTrend?: { date: string; in: number; out: number }[];
    lowStockItems?: ItemVO[]; // 现在引用本文件内定义的 ItemVO
  };
  
  type AIReportResponse = {
    success: boolean;
    content?: string;
    message?: string;
    timestamp?: number;
  }
}

/** 获取仪表盘汇总数据 GET /api/dashboard/summary */
export async function getDashboardSummary(options?: { [key: string]: any }) {
  return request<API.DashboardSummaryVO>('/api/dashboard/summary', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取AI生成的仓库日报 GET /api/dashboard/aiReport */
export async function getDashboardAIReport(options?: { [key: string]: any }) {
  return request<API.AIReportResponse>('/api/dashboard/aiReport', {
    method: 'GET',
    ...(options || {}),
  });
} 