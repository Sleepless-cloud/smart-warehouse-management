package redlib.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import redlib.backend.annotation.BackendModule;
import redlib.backend.annotation.NeedNoPrivilege;
import redlib.backend.annotation.Privilege;
import redlib.backend.service.AIService;

import java.util.Map;

/**
 * Controller for handling AI-related requests.
 */
@RestController
@RequestMapping("/api/ai") // 类级别路径
@BackendModule("ai:智能功能") // 添加模块定义
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * Receives natural language input, parses it using AI, and adds items.
     *
     * @param requestBody A map containing the 'input' string.
     * @return A response map indicating success or failure.
     */
    @PostMapping("parseAndAddItems") // 注意：这里没有开头的斜杠
    @NeedNoPrivilege
    public Map<String, Object> parseAndAddItems(@RequestBody Map<String, String> requestBody) {
        String input = requestBody.get("input");
        if (input == null || input.trim().isEmpty()) {
            return Map.of("success", false, "message", "Input cannot be empty.");
        }
        try {
            Map<String, Integer> result = aiService.parseAndAddItemsFromInput(input);
            int addedCount = result.getOrDefault("added", 0);
            int failedCount = result.getOrDefault("failed", 0);
            // 报告成功条件：至少添加了一个，或者尝试处理了但没有失败（例如AI未返回任何物品）
            if (addedCount > 0 || (addedCount == 0 && failedCount == 0)) {
                return Map.of(
                    "success", true,
                    "message", String.format("处理完成: 添加 %d, 失败 %d.", addedCount, failedCount),
                    "addedCount", addedCount,
                    "failedCount", failedCount // 添加缺失的键值对
                );
            } else { // 只有在添加了0个且至少失败了1个时才报告失败
                 return Map.of(
                    "success", false,
                    "message", String.format("添加物品失败 (处理 %d).", failedCount),
                    "addedCount", addedCount,
                    "failedCount", failedCount
                );
            }
        } catch (Exception e) {
            // Log the exception properly in a real application
            System.err.println("Error processing AI request: " + e.getMessage());
            e.printStackTrace(); // For debugging
            return Map.of("success", false, "message", "处理请求时发生内部错误: " + e.getMessage());
        } // 确保 try 块有对应的 catch 或 finally
    } // 确保方法有结束括号
    
    /**
     * 获取仓库动态AI日报
     * 
     * @return 包含日报内容的响应
     */
    @GetMapping("dailyReport")
    @NeedNoPrivilege
    public Map<String, Object> getDailyReport() {
        try {
            String reportContent = aiService.generateDailyReport();
            return Map.of(
                "success", true,
                "content", reportContent,
                "timestamp", System.currentTimeMillis()
            );
        } catch (Exception e) {
            System.err.println("生成AI日报时发生错误: " + e.getMessage());
            e.printStackTrace(); // 用于调试
            return Map.of(
                "success", false,
                "message", "生成日报失败: " + e.getMessage()
            );
        }
    }
} // 确保类有结束括号 