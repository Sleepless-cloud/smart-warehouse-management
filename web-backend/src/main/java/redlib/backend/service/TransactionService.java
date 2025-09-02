package redlib.backend.service;

import redlib.backend.dto.TransactionDTO;
import redlib.backend.dto.query.TransactionQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.vo.TransactionVO;

/**
 * 出入库记录管理服务接口
 */
public interface TransactionService {
    /**
     * 分页查询出入库记录
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    Page<TransactionVO> listByPage(TransactionQueryDTO queryDTO);

    /**
     * 入库操作
     *
     * @param transactionDTO 入库信息
     * @return 出入库记录ID
     */
    Integer checkIn(TransactionDTO transactionDTO);

    /**
     * 出库操作
     *
     * @param transactionDTO 出库信息
     * @return 出入库记录ID
     */
    Integer checkOut(TransactionDTO transactionDTO);
} 