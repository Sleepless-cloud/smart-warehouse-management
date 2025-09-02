package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.TransactionQueryDTO;
import redlib.backend.model.Transaction;

import java.util.List;

/**
 * 出入库记录数据访问组件
 */
public interface TransactionMapper {
    Transaction selectByPrimaryKey(Integer id);

    /**
     * 新增记录
     *
     * @param record
     * @return
     */
    int insert(Transaction record);

    /**
     * 根据查询条件获取命中个数
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(TransactionQueryDTO queryDTO);

    /**
     * 根据查询条件获取出入库记录列表
     *
     * @param queryDTO 查询条件
     * @param offset   开始位置
     * @param limit    记录数量
     * @return 出入库记录列表
     */
    List<Transaction> list(@Param("queryDTO") TransactionQueryDTO queryDTO, 
                          @Param("offset") Integer offset, 
                          @Param("limit") Integer limit);
                          
    /**
     * 根据物品ID获取出入库记录列表
     *
     * @param itemId 物品ID
     * @return 出入库记录列表
     */
    List<Transaction> listByItemId(@Param("itemId") Integer itemId);
    
    /**
     * 更新所有记录中的操作类型
     * 将"入库"更新为"1"，将"出库"更新为"0"
     *
     * @return 更新的记录数
     */
    int updateAllOperationTypes();
} 