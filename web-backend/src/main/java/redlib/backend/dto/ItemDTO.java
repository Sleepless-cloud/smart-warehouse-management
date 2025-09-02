package redlib.backend.dto;

import lombok.Data;

/**
 * 物品数据传输对象
 */
@Data
public class ItemDTO {
    /**
     * 主键id
     */
    private Integer id;

    /**
     * 物品名称
     */
    private String name;

    /**
     * 物品编号
     */
    private String itemNumber;

    /**
     * 单位
     */
    private String unit;

    /**
     * 规格
     */
    private String specification;

    /**
     * 库存阈值
     */
    private Integer threshold;
} 