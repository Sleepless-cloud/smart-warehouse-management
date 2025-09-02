package redlib.backend.dto.query;

import lombok.Data;
import redlib.backend.model.Page;

/**
 * 物品查询DTO
 */
@Data
public class ItemQueryDTO extends Page {
    /**
     * 物品名称
     */
    private String name;

    /**
     * 物品编号
     */
    private String itemNumber;

    /**
     * 排序字段和方向 (e.g., "name asc", "id desc")
     */
    private String orderBy;
} 