package redlib.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.Privilege;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.service.AIService;
import redlib.backend.service.DashboardService;
import redlib.backend.vo.DashboardSummaryVO;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@BackendModule("dashboard:仪表盘") // 定义模块名
@Slf4j
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private AIService aiService;

    /**
     * 获取仪表盘汇总数据
     *
     * @return 仪表盘汇总数据
     */
    @GetMapping("summary")
    @Privilege // 默认需要登录即可访问，可根据需要添加具体权限
    public DashboardSummaryVO getDashboardSummary() {
        log.info("获取仪表盘汇总数据");
        DashboardSummaryVO summary = dashboardService.getDashboardSummary();
        log.info("仪表盘数据获取成功");
        return summary;
    }
    
    /**
     * 获取仓库动态AI日报
     * 
     * @return 包含AI日报内容的响应
     */
    @GetMapping("aiReport")
    @NeedNoPrivilege // 添加具体权限
    public Map<String, Object> getAIDailyReport() {
        log.info("获取仓库动态AI日报");
        try {
            String reportContent = aiService.generateDailyReport();
            log.info("AI日报获取成功");
            return Map.of(
                "success", true,
                "content", reportContent,
                "timestamp", System.currentTimeMillis()
            );
        } catch (Exception e) {
            log.error("生成AI日报失败", e);
            return Map.of(
                "success", false,
                "message", "生成日报失败: " + e.getMessage()
            );
        }
    }
} 