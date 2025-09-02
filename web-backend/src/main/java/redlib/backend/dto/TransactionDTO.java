package redlib.backend.dto;

import lombok.Data;

/**
 * 出入库记录数据传输对象
 */
@Data
public class TransactionDTO {
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
} 