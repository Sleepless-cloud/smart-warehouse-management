package redlib.backend.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import redlib.backend.dao.ItemMapper;
import redlib.backend.dao.TransactionMapper;
import redlib.backend.dto.TransactionDTO;
import redlib.backend.dto.query.TransactionQueryDTO;
import redlib.backend.model.Item;
import redlib.backend.model.Page;
import redlib.backend.model.Token;
import redlib.backend.model.Transaction;
import redlib.backend.service.AdminService;
import redlib.backend.service.TransactionService;
import redlib.backend.service.utils.TransactionUtils;
import redlib.backend.utils.FormatUtils;
import redlib.backend.utils.PageUtils;
import redlib.backend.utils.ThreadContextHolder;
import redlib.backend.vo.TransactionVO;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 出入库记录管理服务实现类
 */
@Service
@Slf4j
public class TransactionServiceImpl implements TransactionService {
    @Autowired
    private TransactionMapper transactionMapper;
    
    @Autowired
    private ItemMapper itemMapper;
    
    @Autowired
    private AdminService adminService;

    /**
     * 分页查询出入库记录
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    @Override
    public Page<TransactionVO> listByPage(TransactionQueryDTO queryDTO) {
        if (queryDTO == null) {
            queryDTO = new TransactionQueryDTO();
        }

        queryDTO.setItemName(FormatUtils.makeFuzzySearchTerm(queryDTO.getItemName()));
        queryDTO.setItemNumber(FormatUtils.makeFuzzySearchTerm(queryDTO.getItemNumber()));
        Integer size = transactionMapper.count(queryDTO);
        PageUtils pageUtils = new PageUtils(queryDTO.getCurrent(), queryDTO.getPageSize(), size);

        if (size == 0) {
            // 没有命中，则返回空数据。
            return pageUtils.getNullPage();
        }

        // 查询数据
        List<Transaction> list = transactionMapper.list(queryDTO, pageUtils.getOffset(), pageUtils.getLimit());

        // 提取物品ID和经手人ID
        Set<Integer> itemIds = list.stream().map(Transaction::getItemId).collect(Collectors.toSet());
        Set<Integer> adminIds = list.stream()
                .map(Transaction::getHandlerId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        // 获取物品信息
        Map<Integer, Item> itemMap = new HashMap<>();
        for (Integer itemId : itemIds) {
            Item item = itemMapper.selectByPrimaryKey(itemId);
            if (item != null) {
                itemMap.put(itemId, item);
            }
        }

        // 获取id到人名的映射
        Map<Integer, String> nameMap = adminService.getNameMap(adminIds);

        List<TransactionVO> voList = new ArrayList<>();
        for (Transaction transaction : list) {
            Item item = itemMap.get(transaction.getItemId());
            // Transaction对象转VO对象
            TransactionVO vo = TransactionUtils.convertToVO(transaction, item, nameMap);
            voList.add(vo);
        }

        return new Page<>(pageUtils.getCurrent(), pageUtils.getPageSize(), pageUtils.getTotal(), voList);
    }

    /**
     * 入库操作
     *
     * @param transactionDTO 入库信息
     * @return 出入库记录ID
     */
    @Override
    @Transactional
    public Integer checkIn(TransactionDTO transactionDTO) {
        transactionDTO.setOperationType("1");
        return processTransaction(transactionDTO, false);
    }

    /**
     * 出库操作
     *
     * @param transactionDTO 出库信息
     * @return 出入库记录ID
     */
    @Override
    @Transactional
    public Integer checkOut(TransactionDTO transactionDTO) {
        transactionDTO.setOperationType("0");
        return processTransaction(transactionDTO, true);
    }
    
    /**
     * 处理入库或出库操作
     *
     * @param transactionDTO 操作信息
     * @param isCheckOut 是否是出库操作
     * @return 操作记录ID
     */
    private Integer processTransaction(TransactionDTO transactionDTO, boolean isCheckOut) {
        log.info("开始处理{}操作, 物品ID: {}, 数量: {}", 
                isCheckOut ? "出库" : "入库", 
                transactionDTO.getItemId(), 
                transactionDTO.getQuantity());
                
        // 获取物品信息
        Item item = itemMapper.selectByPrimaryKey(transactionDTO.getItemId());
        Assert.notNull(item, "物品不存在，ID为: " + transactionDTO.getItemId());
        log.info("物品当前库存: {}", item.getStockQuantity());
        
        // 获取当前登录用户信息并设置为经手人
        Token token = ThreadContextHolder.getToken();
        if (token != null) {
            transactionDTO.setHandlerId(token.getUserId());
            log.info("自动设置经手人ID: {}", token.getUserId());
        }
        
        // 验证操作信息
        TransactionUtils.validateTransaction(transactionDTO, isCheckOut, item);
        
        // 更新库存
        int quantity = transactionDTO.getQuantity();
        if (isCheckOut) {
            quantity = -quantity; // 出库为负数
        }
        log.info("更新库存: {} -> {}", item.getStockQuantity(), item.getStockQuantity() + quantity);
        int result = itemMapper.updateStock(item.getId(), quantity);
        Assert.isTrue(result > 0, "更新库存失败");
        
        // 重新查询最新的库存
        Item updatedItem = itemMapper.selectByPrimaryKey(item.getId());
        log.info("更新后库存: {}", updatedItem.getStockQuantity());
        
        // 创建出入库记录
        Transaction transaction = new Transaction();
        BeanUtils.copyProperties(transactionDTO, transaction);
        transaction.setPostStock(updatedItem.getStockQuantity()); // 设置操作后库存
        transaction.setOperationTime(new Date());
        
        // 保存记录
        log.info("保存出入库记录");
        transactionMapper.insert(transaction);
        log.info("完成{}操作, 记录ID: {}", isCheckOut ? "出库" : "入库", transaction.getId());
        return transaction.getId();
    }

    /**
     * 数据迁移：将数据库中文本格式的操作类型转换为数字格式
     * 在应用启动时自动执行
     */
    @EventListener(ContextRefreshedEvent.class)
    public void migrateOperationTypes() {
        try {
            log.info("开始迁移操作类型数据...");
            int count = transactionMapper.updateAllOperationTypes();
            log.info("操作类型数据迁移完成，共更新 {} 条记录", count);
        } catch (Exception e) {
            log.error("操作类型数据迁移失败", e);
        }
    }
} 