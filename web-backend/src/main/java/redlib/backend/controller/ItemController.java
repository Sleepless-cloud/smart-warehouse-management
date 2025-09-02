package redlib.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.dto.ItemDTO;
import redlib.backend.dto.query.ItemQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.service.ItemService;
import redlib.backend.vo.ItemVO;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 物品管理后端服务模块
 */
@RestController
@RequestMapping("/api/item")
@BackendModule({"page:页面", "update:修改", "add:创建", "delete:删除"})
public class ItemController {
    @Autowired
    private ItemService itemService;

    /**
     * 分页查询物品
     *
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    @PostMapping("listItem")
    @NeedNoPrivilege
    public Page<ItemVO> listItem(@RequestBody ItemQueryDTO queryDTO) {
        return itemService.listByPage(queryDTO);
    }

    /**
     * 添加物品
     *
     * @param itemDTO 物品信息
     * @return 物品ID
     */
    @PostMapping("addItem")
    @NeedNoPrivilege
    public Integer addItem(@RequestBody ItemDTO itemDTO) {
        return itemService.addItem(itemDTO);
    }

    /**
     * 更新物品信息
     *
     * @param itemDTO 物品信息
     * @return 物品ID
     */
    @PostMapping("updateItem")
    @NeedNoPrivilege
    public Integer updateItem(@RequestBody ItemDTO itemDTO) {
        return itemService.updateItem(itemDTO);
    }

    /**
     * 根据ID获取物品信息
     *
     * @param id 物品ID
     * @return 物品DTO
     */
    @GetMapping("getItem")
    @NeedNoPrivilege
    public ItemDTO getItem(Integer id) {
        return itemService.getById(id);
    }

    /**
     * 批量删除物品
     *
     * @param ids ID列表
     */
    @PostMapping("deleteItem")
    @NeedNoPrivilege
    public void deleteItem(@RequestBody List<Integer> ids) {
        itemService.deleteByIds(ids);
    }

    /**
     * 导出物品信息到Excel
     *
     * @param queryDTO 查询条件
     * @param response HTTP响应
     * @throws Exception IO异常
     */
    @PostMapping("exportItem")
    @Privilege("page")
    public void exportItem(@RequestBody ItemQueryDTO queryDTO, HttpServletResponse response) throws Exception {
        Workbook workbook = itemService.export(queryDTO);
        response.setContentType("application/vnd.ms-excel");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd$HHmmss");
        response.addHeader("Content-Disposition", "attachment;filename=file" + sdf.format(new Date()) + ".xls");
        OutputStream os = response.getOutputStream();
        workbook.write(os);
        os.close();
        workbook.close();
    }
} 