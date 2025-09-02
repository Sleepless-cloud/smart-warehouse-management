package redlib.backend.vo;

import lombok.Data;

import java.util.Date;

/**
 * 出入库记录视图对象
 */
@Data
public class TransactionVO {
    /**
     * 主键id
     */
    private Integer id;

    /**
     * 物品ID
     */
    private Integer itemId;

    /**
     * 物品名称
     */
    private String itemName;

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
     * 操作类型（入库/出库）
     */
    private String operationType;

    /**
     * 操作数量
     */
    private Integer quantity;

    /**
     * 经手人姓名
     */
    private String handlerName;

    /**
     * 备注
     */
    private String remark;

    /**
     * 操作后库存
     */
    private Integer postStock;

    /**
     * 操作时间
     */
    private Date operationTime;
} 