package redlib.backend.vo;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘汇总数据视图对象
 */
@Data
public class DashboardSummaryVO {
    /**
     * 物品种类总数
     */
    private Long totalItemCount;

    /**
     * 总库存量
     */
    private Long totalStockQuantity;

    /**
     * 低库存物品数
     */
    private Long lowStockItemCount;

    /**
     * 今日操作次数
     */
    private Long todayTransactionCount;

    /**
     * 库存量 Top 5 物品 (Item Name -> Quantity)
     */
    private List<Map<String, Object>> topItemsByStock;

    /**
     * 近 7 日出入库趋势 (Date -> {in: count, out: count})
     */
    private List<Map<String, Object>> recentTransactionTrend;

    /**
     * 低库存预警物品列表
     */
    private List<ItemVO> lowStockItems;
} 