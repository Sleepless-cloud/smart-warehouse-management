package redlib.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.dto.TransactionDTO;
import redlib.backend.dto.query.TransactionQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.service.TransactionService;
import redlib.backend.vo.TransactionVO;

/**
 * 出入库记录管理后端服务模块
 */
@RestController
@RequestMapping("/api/transaction")
@BackendModule({"page:页面", "checkIn:入库", "checkOut:出库"})
@Slf4j
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    /**
     * 分页查询出入库记录
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    @PostMapping("listTransaction")
    @NeedNoPrivilege
    public Page<TransactionVO> listTransaction(@RequestBody TransactionQueryDTO queryDTO) {
        log.info("查询出入库记录，参数: {}", queryDTO);
        Page<TransactionVO> result = transactionService.listByPage(queryDTO);
        log.info("查询结果数量: {}", result.getTotal());
        return result;
    }

    /**
     * 入库操作
     * 注意：不需要提供经手人ID，系统会自动使用当前登录用户的ID作为经手人
     *
     * @param transactionDTO 入库信息，需要包含以下字段：
     *                       itemId - 物品ID（必填）
     *                       quantity - 入库数量（必填，必须大于0）
     *                       remark - 备注（可选）
     * @return 出入库记录ID
     */
    @PostMapping("checkIn")
    @NeedNoPrivilege
    public Integer checkIn(@RequestBody TransactionDTO transactionDTO) {
        log.info("执行入库操作，参数: {}", transactionDTO);
        Integer id = transactionService.checkIn(transactionDTO);
        log.info("入库操作完成，记录ID: {}", id);
        return id;
    }

    /**
     * 出库操作
     * 注意：不需要提供经手人ID，系统会自动使用当前登录用户的ID作为经手人
     *
     * @param transactionDTO 出库信息，需要包含以下字段：
     *                       itemId - 物品ID（必填）
     *                       quantity - 出库数量（必填，必须大于0且不超过当前库存）
     *                       remark - 备注（可选）
     * @return 出入库记录ID
     */
    @PostMapping("checkOut")
    @NeedNoPrivilege
    public Integer checkOut(@RequestBody TransactionDTO transactionDTO) {
        log.info("执行出库操作，参数: {}", transactionDTO);
        Integer id = transactionService.checkOut(transactionDTO);
        log.info("出库操作完成，记录ID: {}", id);
        return id;
    }
} 