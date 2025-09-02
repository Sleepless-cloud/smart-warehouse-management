package redlib.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import redlib.backend.dao.DashboardMapper;
import redlib.backend.service.DashboardService;
import redlib.backend.vo.DashboardSummaryVO;
import redlib.backend.vo.ItemVO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private DashboardMapper dashboardMapper;

    private static final int TOP_ITEM_LIMIT = 5;
    private static final int TREND_DAYS = 7;

    @Override
    public DashboardSummaryVO getDashboardSummary() {
        DashboardSummaryVO summary = new DashboardSummaryVO();

        // 1. 获取核心指标
        summary.setTotalItemCount(dashboardMapper.countTotalItems());
        summary.setTotalStockQuantity(dashboardMapper.sumTotalStockQuantity());
        summary.setLowStockItemCount(dashboardMapper.countLowStockItems());
        LocalDate today = LocalDate.now();
        summary.setTodayTransactionCount(dashboardMapper.countTransactionsByDateRange(today, today));

        // 2. 获取库存 Top N 物品
        List<Map<String, Object>> topItemsRaw = dashboardMapper.listTopItemsByStock(TOP_ITEM_LIMIT);
        // 将 stock_quantity 转换为 Long 类型，以防数据库返回 BigDecimal 等类型
        List<Map<String, Object>> topItems = topItemsRaw.stream()
                .map(item -> {
                    Map<String, Object> newItem = new HashMap<>(item);
                    Object quantity = newItem.get("quantity");
                    if (quantity instanceof Number) {
                        newItem.put("quantity", ((Number) quantity).longValue());
                    }
                    return newItem;
                })
                .collect(Collectors.toList());
        summary.setTopItemsByStock(topItems);

        // 3. 获取近 7 日出入库趋势
        LocalDate startDate = today.minusDays(TREND_DAYS - 1);
        List<Map<String, Object>> dailyCountsRaw = dashboardMapper.countDailyTransactionsByType(startDate, today);

        // 4. 处理趋势数据，确保每天都有入库和出库数据（即使为0）
        Map<String, Map<Integer, Long>> groupedCounts = dailyCountsRaw.stream()
                .collect(Collectors.groupingBy(
                        map -> map.get("date").toString(), // 按日期分组
                        Collectors.toMap(
                                map -> ((Number) map.get("type")).intValue(), // key 为操作类型 (0 or 1)
                                map -> ((Number) map.get("count")).longValue() // value 为数量
                        )
                ));

        List<Map<String, Object>> trend = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
        for (int i = 0; i < TREND_DAYS; i++) {
            LocalDate date = startDate.plusDays(i);
            String dateStr = date.format(formatter);
            Map<Integer, Long> counts = groupedCounts.getOrDefault(dateStr, Collections.emptyMap());

            Map<String, Object> dailyData = new LinkedHashMap<>(); // 使用 LinkedHashMap 保证 key 的顺序
            dailyData.put("date", dateStr);
            dailyData.put("in", counts.getOrDefault(1, 0L)); // 1 代表入库
            dailyData.put("out", counts.getOrDefault(0, 0L)); // 0 代表出库
            trend.add(dailyData);
        }
        summary.setRecentTransactionTrend(trend);

        // 5. 获取低库存物品列表
        summary.setLowStockItems(dashboardMapper.listLowStockItems());

        return summary;
    }
} 