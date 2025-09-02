package redlib.backend.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import redlib.backend.vo.ItemVO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘数据访问对象
 */
@Mapper
public interface DashboardMapper {

    /**
     * 获取物品总数
     *
     * @return 物品总数
     */
    Long countTotalItems();

    /**
     * 获取总库存量
     *
     * @return 总库存量
     */
    Long sumTotalStockQuantity();

    /**
     * 获取低库存物品数量
     *
     * @return 低库存物品数量
     */
    Long countLowStockItems();

    /**
     * 获取指定日期范围内的交易次数
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 交易次数
     */
    Long countTransactionsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 获取库存量 Top N 的物品
     *
     * @param limit 数量限制
     * @return Top N 物品列表 (包含 name 和 stock_quantity)
     */
    List<Map<String, Object>> listTopItemsByStock(@Param("limit") int limit);

    /**
     * 获取指定日期范围内的每日出入库数量
     *
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return 每日出入库数量列表 (包含 date, type, count)
     */
    List<Map<String, Object>> countDailyTransactionsByType(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 获取低库存物品列表
     *
     * @return 低库存物品列表
     */
    List<ItemVO> listLowStockItems();

} 