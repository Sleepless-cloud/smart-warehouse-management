package redlib.backend.model;

import lombok.Data;

import java.util.Date;

/**
 * 物品实体对象
 */
@Data
public class Item {
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
     * 库存数量
     */
    private Integer stockQuantity;

    /**
     * 库存阈值
     */
    private Integer threshold;

    /**
     * 创建日期
     */
    private Date createdAt;

    /**
     * 修改日期
     */
    private Date updatedAt;

    /**
     * 最后操作人ID
     */
    private Integer operatorId;
} 