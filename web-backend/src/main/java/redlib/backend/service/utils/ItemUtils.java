package redlib.backend.service.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import redlib.backend.dto.ItemDTO;
import redlib.backend.model.Item;
import redlib.backend.vo.ItemVO;

import java.util.Map;

/**
 * 物品工具类
 */
public class ItemUtils {
    /**
     * 验证物品数据合法性
     *
     * @param itemDTO 物品输入对象
     */
    public static void validateItem(ItemDTO itemDTO) {
        Assert.notNull(itemDTO, "物品信息不能为空");
        Assert.isTrue(StringUtils.hasText(itemDTO.getName()), "物品名称不能为空");
        Assert.isTrue(StringUtils.hasText(itemDTO.getItemNumber()), "物品编号不能为空");
        Assert.isTrue(StringUtils.hasText(itemDTO.getUnit()), "单位不能为空");
        Assert.isTrue(StringUtils.hasText(itemDTO.getSpecification()), "规格不能为空");
        Assert.notNull(itemDTO.getThreshold(), "库存阈值不能为空");
        Assert.isTrue(itemDTO.getThreshold() >= 0, "库存阈值不能小于0");
    }

    /**
     * 转换Item对象为ItemVO对象
     *
     * @param item    物品对象
     * @param nameMap 用户id到用户名的映射
     * @return 物品VO对象
     */
    public static ItemVO convertToVO(Item item, Map<Integer, String> nameMap) {
        if (item == null) {
            return null;
        }

        ItemVO vo = new ItemVO();
        BeanUtils.copyProperties(item, vo);
        
        if (nameMap != null && item.getOperatorId() != null) {
            vo.setOperatorName(nameMap.get(item.getOperatorId()));
        }
        
        return vo;
    }
} 