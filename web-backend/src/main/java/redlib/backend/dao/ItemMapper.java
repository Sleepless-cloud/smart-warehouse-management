package redlib.backend.dao;

import org.apache.ibatis.annotations.Param;
import redlib.backend.dto.query.ItemQueryDTO;
import redlib.backend.model.Item;

import java.util.List;

/**
 * 物品数据访问组件
 */
public interface ItemMapper {
    Item selectByPrimaryKey(Integer id);

    /**
     * 新增记录
     *
     * @param record
     * @return
     */
    int insert(Item record);

    /**
     * 根据主键更新记录
     *
     * @param record
     * @return
     */
    int updateByPrimaryKey(Item record);

    /**
     * 根据物品编号获取物品信息
     *
     * @param itemNumber 物品编号
     * @return 物品信息
     */
    Item getByItemNumber(@Param("itemNumber") String itemNumber);

    /**
     * 根据查询条件获取命中个数
     *
     * @param queryDTO 查询条件
     * @return 命中数量
     */
    Integer count(ItemQueryDTO queryDTO);

    /**
     * 根据查询条件获取物品列表
     *
     * @param queryDTO 查询条件
     * @param offset   开始位置
     * @param limit    记录数量
     * @return 物品列表
     */
    List<Item> list(@Param("queryDTO") ItemQueryDTO queryDTO, 
                   @Param("offset") Integer offset, 
                   @Param("limit") Integer limit);

    /**
     * 根据查询条件获取所有物品列表
     *
     * @param queryDTO 查询条件
     * @return 物品列表
     */
    List<Item> listAll(@Param("queryDTO") ItemQueryDTO queryDTO);

    /**
     * 根据id列表批量删除物品
     *
     * @param idList id列表
     */
    void deleteByIds(@Param("idList") List<Integer> idList);
    
    /**
     * 更新物品库存
     *
     * @param id 物品ID
     * @param quantity 变动数量（正数为增加，负数为减少）
     */
    int updateStock(@Param("id") Integer id, @Param("quantity") Integer quantity);
} 