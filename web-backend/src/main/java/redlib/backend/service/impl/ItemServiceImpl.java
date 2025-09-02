package redlib.backend.service.impl;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import redlib.backend.dao.ItemMapper;
import redlib.backend.dto.ItemDTO;
import redlib.backend.dto.query.ItemQueryDTO;
import redlib.backend.model.Item;
import redlib.backend.model.Page;
import redlib.backend.model.Token;
import redlib.backend.service.AdminService;
import redlib.backend.service.ItemService;
import redlib.backend.service.utils.ItemUtils;
import redlib.backend.utils.FormatUtils;
import redlib.backend.utils.PageUtils;
import redlib.backend.utils.ThreadContextHolder;
import redlib.backend.utils.XlsUtils;
import redlib.backend.vo.ItemVO;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.Workbook;

/**
 * 物品管理服务实现类
 */
@Service
public class ItemServiceImpl implements ItemService {
    @Autowired
    private ItemMapper itemMapper;

    @Autowired
    private AdminService adminService;

    /**
     * 分页查询物品
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    @Override
    public Page<ItemVO> listByPage(ItemQueryDTO queryDTO) {
        if (queryDTO == null) {
            queryDTO = new ItemQueryDTO();
        }

        queryDTO.setName(FormatUtils.makeFuzzySearchTerm(queryDTO.getName()));
        queryDTO.setItemNumber(FormatUtils.makeFuzzySearchTerm(queryDTO.getItemNumber()));
        Integer size = itemMapper.count(queryDTO);
        PageUtils pageUtils = new PageUtils(queryDTO.getCurrent(), queryDTO.getPageSize(), size);

        if (size == 0) {
            // 没有命中，则返回空数据。
            return pageUtils.getNullPage();
        }

        // 利用myBatis到数据库中查询数据，以分页的方式
        List<Item> list = itemMapper.list(queryDTO, pageUtils.getOffset(), pageUtils.getLimit());

        // 提取list列表中的操作人字段，到一个Set集合中去
        Set<Integer> adminIds = list.stream()
                .map(Item::getOperatorId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        // 获取id到人名的映射
        Map<Integer, String> nameMap = adminService.getNameMap(adminIds);

        List<ItemVO> voList = new ArrayList<>();
        for (Item item : list) {
            // Item对象转VO对象
            ItemVO vo = ItemUtils.convertToVO(item, nameMap);
            voList.add(vo);
        }

        return new Page<>(pageUtils.getCurrent(), pageUtils.getPageSize(), pageUtils.getTotal(), voList);
    }

    /**
     * 添加物品
     *
     * @param itemDTO 物品信息
     * @return 物品ID
     */
    @Override
    public Integer addItem(ItemDTO itemDTO) {
        Token token = ThreadContextHolder.getToken();
        // 校验输入数据正确性
        ItemUtils.validateItem(itemDTO);
        
        // 检查物品编号是否已存在
        Item existItem = itemMapper.getByItemNumber(itemDTO.getItemNumber());
        Assert.isNull(existItem, "物品编号已存在: " + itemDTO.getItemNumber());
        
        // 创建实体对象，用以保存到数据库
        Item item = new Item();
        // 将输入的字段全部复制到实体对象中
        BeanUtils.copyProperties(itemDTO, item);
        item.setStockQuantity(0); // 初始库存为0
        item.setCreatedAt(new Date());
        item.setUpdatedAt(new Date());
        item.setOperatorId(token.getUserId());
        // 调用DAO方法保存到数据库表
        itemMapper.insert(item);
        return item.getId();
    }

    /**
     * 根据ID获取物品信息
     *
     * @param id 物品ID
     * @return 物品DTO
     */
    @Override
    public ItemDTO getById(Integer id) {
        Assert.notNull(id, "物品ID不能为空");
        Item item = itemMapper.selectByPrimaryKey(id);
        Assert.notNull(item, "物品不存在，ID为: " + id);
        ItemDTO dto = new ItemDTO();
        BeanUtils.copyProperties(item, dto);
        return dto;
    }

    /**
     * 更新物品信息
     *
     * @param itemDTO 物品信息
     * @return 物品ID
     */
    @Override
    public Integer updateItem(ItemDTO itemDTO) {
        Token token = ThreadContextHolder.getToken();
        // 校验输入数据正确性
        ItemUtils.validateItem(itemDTO);
        Assert.notNull(itemDTO.getId(), "物品ID不能为空");
        
        Item item = itemMapper.selectByPrimaryKey(itemDTO.getId());
        Assert.notNull(item, "物品不存在，ID为: " + itemDTO.getId());
        
        // 如果编号变了，检查新编号是否已存在
        if (!item.getItemNumber().equals(itemDTO.getItemNumber())) {
            Item existItem = itemMapper.getByItemNumber(itemDTO.getItemNumber());
            Assert.isNull(existItem, "物品编号已存在: " + itemDTO.getItemNumber());
        }
        
        // 更新物品信息，保留原库存不变
        BeanUtils.copyProperties(itemDTO, item);
        item.setUpdatedAt(new Date());
        item.setOperatorId(token.getUserId());
        itemMapper.updateByPrimaryKey(item);
        return item.getId();
    }

    /**
     * 批量删除物品
     *
     * @param ids ID列表
     */
    @Override
    public void deleteByIds(List<Integer> ids) {
        Assert.notEmpty(ids, "物品ID列表不能为空");
        itemMapper.deleteByIds(ids);
    }
    
    /**
     * 导出物品信息到Excel
     *
     * @param queryDTO 查询条件
     * @return Excel工作簿
     */
    @Override
    public Workbook export(ItemQueryDTO queryDTO) {
        // Prepare query (apply fuzzy search terms)
        queryDTO.setName(FormatUtils.makeFuzzySearchTerm(queryDTO.getName()));
        queryDTO.setItemNumber(FormatUtils.makeFuzzySearchTerm(queryDTO.getItemNumber()));

        // Fetch ALL items matching the query and order
        List<Item> itemList = itemMapper.listAll(queryDTO);

        // Prepare data for export
        List<ItemVO> voList = new ArrayList<>();
        if (!itemList.isEmpty()) {
            // Get operator names
            Set<Integer> adminIds = itemList.stream()
                    .map(Item::getOperatorId)
                    .filter(id -> id != null)
                    .collect(Collectors.toSet());
            Map<Integer, String> nameMap = adminService.getNameMap(adminIds);
            
            // Convert Item to ItemVO
            for (Item item : itemList) {
                ItemVO vo = ItemUtils.convertToVO(item, nameMap);
                voList.add(vo);
            }
        }

        // Define Excel column mapping
        Map<String, String> map = new LinkedHashMap<>();
        map.put("id", "物品ID");
        map.put("name", "物品名称");
        map.put("itemNumber", "物品编号");
        map.put("unit", "单位");
        map.put("specification", "规格");
        map.put("stockQuantity", "库存数量");
        map.put("threshold", "预警阈值");
        map.put("updatedAt", "更新时间");
        map.put("operatorName", "操作人");

        // Use XlsUtils to export the complete list
        // We pass a lambda that simply returns the full list for the first (and only) page
        final AtomicBoolean dataFetched = new AtomicBoolean(false);
        Workbook workbook = XlsUtils.exportToExcel(page -> {
            if (dataFetched.get()) {
                return null; // Return null after the first call
            }
            dataFetched.set(true);
            return voList; // Return the complete list
        }, map);

        return workbook;
    }
} 