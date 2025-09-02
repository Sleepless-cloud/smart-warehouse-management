package redlib.backend.model;

import lombok.Data;

import java.util.Date;

/**
 * 出入库记录实体对象
 */
@Data
public class Transaction {
    /**
     * 主键id
     */
    private Integer id;

    /**
     * 物品ID
     */
    private Integer itemId;

    /**
     * 操作类型（入库/出库）
     */
    private String operationType;

    /**
     * 操作数量
     */
    private Integer quantity;

    /**
     * 经手人ID
     */
    private Integer handlerId;

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