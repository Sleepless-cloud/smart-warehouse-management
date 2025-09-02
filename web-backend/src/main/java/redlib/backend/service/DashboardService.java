package redlib.backend.service;

import redlib.backend.vo.DashboardSummaryVO;

/**
 * 仪表盘服务接口
 */
public interface DashboardService {
    /**
     * 获取仪表盘汇总数据
     *
     * @return 仪表盘汇总数据
     */
    DashboardSummaryVO getDashboardSummary();
} 