package redlib.backend.service;

import org.apache.poi.ss.usermodel.Workbook;
import redlib.backend.dto.ItemDTO;
import redlib.backend.dto.query.ItemQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.vo.ItemVO;

import java.util.List;

/**
 * 物品管理服务接口
 */
public interface ItemService {
    /**
     * 分页查询物品
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    Page<ItemVO> listByPage(ItemQueryDTO queryDTO);

    /**
     * 添加物品信息
     *
     * @param itemDTO 物品信息
     * @return 新增物品的ID
     */
    Integer addItem(ItemDTO itemDTO);

    /**
     * 根据ID获取物品信息
     *
     * @param id 物品ID
     * @return 物品DTO
     */
    ItemDTO getById(Integer id);

    /**
     * 更新物品信息
     *
     * @param itemDTO 物品信息
     * @return 物品ID
     */
    Integer updateItem(ItemDTO itemDTO);

    /**
     * 批量删除物品
     *
     * @param ids ID列表
     */
    void deleteByIds(List<Integer> ids);
    
    /**
     * 导出物品信息到Excel
     *
     * @param queryDTO 查询条件
     * @return Excel工作簿
     */
    Workbook export(ItemQueryDTO queryDTO);
} 