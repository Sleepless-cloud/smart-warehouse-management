package redlib.backend.service.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import redlib.backend.dto.TransactionDTO;
import redlib.backend.model.Item;
import redlib.backend.model.Transaction;
import redlib.backend.vo.TransactionVO;

import java.util.Map;

/**
 * 出入库记录工具类
 */
public class TransactionUtils {
    /**
     * 验证出入库记录数据合法性
     *
     * @param transactionDTO 出入库记录输入对象
     * @param isCheckOut 是否是出库操作
     * @param item 物品对象
     */
    public static void validateTransaction(TransactionDTO transactionDTO, boolean isCheckOut, Item item) {
        Assert.notNull(transactionDTO, "出入库记录信息不能为空");
        Assert.notNull(transactionDTO.getItemId(), "物品ID不能为空");
        Assert.notNull(transactionDTO.getQuantity(), "操作数量不能为空");
        Assert.isTrue(transactionDTO.getQuantity() > 0, "操作数量必须大于0");
        // 经手人ID现在由系统自动设置为当前登录用户，不再需要验证
        
        if (isCheckOut && item != null) {
            Assert.isTrue(item.getStockQuantity() >= transactionDTO.getQuantity(), 
                    "库存不足，当前库存: " + item.getStockQuantity());
        }
    }

    /**
     * 转换Transaction对象为TransactionVO对象
     *
     * @param transaction 出入库记录对象
     * @param item 物品对象
     * @param nameMap 用户id到用户名的映射
     * @return 出入库记录VO对象
     */
    public static TransactionVO convertToVO(Transaction transaction, Item item, Map<Integer, String> nameMap) {
        if (transaction == null) {
            return null;
        }

        TransactionVO vo = new TransactionVO();
        BeanUtils.copyProperties(transaction, vo);
        
        // 根据数据库中的操作类型，统一转换为前端需要的格式：1代表入库，0代表出库
        String type = transaction.getOperationType();
        if (type != null) {
            if (type.equals("入库") || type.equals("IN") || type.equals("in")) {
                vo.setOperationType("1");
            } else if (type.equals("出库") || type.equals("OUT") || type.equals("out")) {
                vo.setOperationType("0");
            }
            // 如果已经是数字格式，保持不变
        }
        
        if (item != null) {
            vo.setItemName(item.getName());
            vo.setItemNumber(item.getItemNumber());
            vo.setUnit(item.getUnit());
            vo.setSpecification(item.getSpecification());
        }
        
        if (nameMap != null && transaction.getHandlerId() != null) {
            vo.setHandlerName(nameMap.get(transaction.getHandlerId()));
        }
        
        return vo;
    }
} 