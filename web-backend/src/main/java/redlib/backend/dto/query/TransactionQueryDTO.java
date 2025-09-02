package redlib.backend.dto.query;

import lombok.Data;
import redlib.backend.model.Page;

import java.util.Date;

/**
 * 出入库记录查询DTO
 */
@Data
public class TransactionQueryDTO extends Page {
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
     * 操作类型（入库/出库）
     */
    private String operationType;

    /**
     * 开始日期
     */
    private Date startDate;

    /**
     * 结束日期
     */
    private Date endDate;
} 