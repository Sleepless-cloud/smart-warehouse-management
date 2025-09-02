package redlib.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import redlib.backend.dto.ItemDTO;
import redlib.backend.dto.TransactionDTO;
import redlib.backend.dto.query.ItemQueryDTO;
import redlib.backend.model.Page;
import redlib.backend.vo.DashboardSummaryVO;
import redlib.backend.vo.ItemVO;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    @Autowired
    private ItemService itemService;
    
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private ObjectMapper objectMapper; // For JSON parsing

    // Consider moving these to configuration properties
    private static final String ZHIPU_API_KEY = "a1c6e0f3ae764f4db51db5b22cc6b00c.Kcm58efUq6jURAaM";
    private static final String ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    private static final int API_TIMEOUT_MS = 30000; // 30 seconds timeout for API call

    // Corrected regex: Use double backslashes for Java string literals
    private static final Pattern JSON_ARRAY_PATTERN = Pattern.compile("\\[\\s*\\{.*?\\}\\s*\\]", Pattern.DOTALL);

    @Transactional // Make the whole process transactional
    public Map<String, Integer> parseAndAddItemsFromInput(String input) throws Exception {
        logger.info("Starting AI parsing for input: {}", input);
        List<Map<String, Object>> aiParsedItems = callZhipuAI(input);

        if (aiParsedItems == null || aiParsedItems.isEmpty()) {
            logger.warn("AI did not return any valid items or parsing failed for input: {}", input);
            return Map.of("added", 0, "failed", 0);
        }
        logger.info("AI parsed {} potential items.", aiParsedItems.size());

        Set<String> existingItemNumbers = new HashSet<>();
        int maxCode = 0;
        try {
            ItemQueryDTO query = new ItemQueryDTO();
            query.setPageSize(Integer.MAX_VALUE); // Attempt to get all items reliably
            query.setCurrent(1);
            Page<ItemVO> response = itemService.listByPage(query);
            if (response != null && response.getList() != null) {
                logger.debug("Found {} existing items.", response.getList().size());
                for (ItemVO item : response.getList()) {
                    String itemNumberStr = item.getItemNumber();
                    if (itemNumberStr != null && !itemNumberStr.isEmpty()) {
                        existingItemNumbers.add(itemNumberStr);
                        try {
                            int currentNumber = Integer.parseInt(itemNumberStr);
                            maxCode = Math.max(maxCode, currentNumber);
                        } catch (NumberFormatException e) {
                            logger.warn("Non-numeric itemNumber encountered: {}", itemNumberStr);
                        }
                    }
                }
            } else {
                logger.warn("Listing existing items returned null or empty list.");
            }
        } catch (Exception e) {
            logger.error("Error fetching existing items: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to determine existing item codes.", e);
        }
        logger.info("Determined Max Code: {}", maxCode);
        logger.debug("Existing Item Numbers: {}", existingItemNumbers);

        int addedCount = 0;
        int failedCount = 0;
        int nextCode = maxCode + 1;  // 默认从最大编号加一开始

        // 检查是否有用户指定的起始编号
        if (!aiParsedItems.isEmpty() && aiParsedItems.get(0).containsKey("startNumber")) {
            Object startNumberObj = aiParsedItems.get(0).get("startNumber");
            if (startNumberObj instanceof Number) {
                nextCode = ((Number) startNumberObj).intValue();
                logger.info("Using user specified start number: {}", nextCode);
            } else if (startNumberObj instanceof String) {
                try { nextCode = Integer.parseInt((String) startNumberObj); } catch (NumberFormatException e) { logger.warn("Could not parse startNumber '{}' as int, using default.", startNumberObj); }
            }
        }

        for (Map<String, Object> aiItem : aiParsedItems) {
            Integer newItemId = null; // To store the ID of the newly added item
            try {
                ItemDTO newItem = new ItemDTO();
                newItem.setName(Objects.toString(aiItem.get("name"), "未知物品"));
                newItem.setUnit(Objects.toString(aiItem.get("unit"), "个"));
                newItem.setSpecification(Objects.toString(aiItem.get("specification"), "普通"));

                // Extract threshold
                Object thresholdObj = aiItem.get("threshold");
                int threshold = 10; // Default threshold
                if (thresholdObj instanceof Number) {
                    threshold = ((Number) thresholdObj).intValue();
                } else if (thresholdObj instanceof String) {
                    try { threshold = Integer.parseInt((String) thresholdObj); } catch (NumberFormatException e) { logger.warn("Could not parse threshold '{}' as int, using default 10.", thresholdObj); }
                }
                newItem.setThreshold(threshold);

                // Extract quantity
                Object quantityObj = aiItem.get("quantity");
                int quantity = 0; // Default quantity
                if (quantityObj instanceof Number) {
                    quantity = ((Number) quantityObj).intValue();
                } else if (quantityObj instanceof String) {
                    try { quantity = Integer.parseInt((String) quantityObj); } catch (NumberFormatException e) { logger.warn("Could not parse quantity '{}' as int, using default 0.", quantityObj); }
                }
                 // Quantity is NOT set on ItemDTO, as it represents the *initial* stock, handled by transaction

                // Assign the next available item number
                String newItemNumber = String.valueOf(nextCode++);
                newItem.setItemNumber(newItemNumber);

                logger.info("Attempting to add item: Name='{}', Unit='{}', Spec='{}', Threshold={}, ItemNumber={}, ParsedQuantity={}",
                            newItem.getName(), newItem.getUnit(), newItem.getSpecification(), newItem.getThreshold(), newItem.getItemNumber(), quantity);

                // Add the item and get its ID (Requires ItemService.addItem to return Integer)
                newItemId = itemService.addItem(newItem);

                if (newItemId != null) {
                    addedCount++;
                    existingItemNumbers.add(newItemNumber); // Keep track of used numbers in this batch
                    logger.info("Successfully added item with ID: {} and Number: {}", newItemId, newItemNumber);

                    // If quantity is greater than 0, perform check-in
                    if (quantity > 0) {
                        logger.info("Performing check-in for item ID: {} with quantity: {}", newItemId, quantity);
                        TransactionDTO transactionDTO = new TransactionDTO();
                        transactionDTO.setItemId(newItemId);
                        transactionDTO.setQuantity(quantity);
                        transactionDTO.setOperationType("IN"); // Or use a constant/enum
                        transactionDTO.setRemark("智能添加入库"); // Add a remark

                        try {
                            Integer transactionId = transactionService.checkIn(transactionDTO);
                            logger.info("Check-in successful for item ID: {}, transaction ID: {}", newItemId, transactionId);
                        } catch (Exception checkInException) {
                            // Log the check-in error but don't necessarily fail the whole process?
                            // Or maybe re-throw/increment failedCount? Decided to log and continue.
                            logger.error("Check-in failed for item ID: {} | Quantity: {} | Error: {}",
                                         newItemId, quantity, checkInException.getMessage(), checkInException);
                            // Optionally increment failedCount here if a failed check-in should count as a failure
                        }
                    } else {
                        logger.info("Quantity is 0, skipping check-in for item ID: {}", newItemId);
                    }
                } else {
                    // If addItem returned null, it means adding failed.
                    logger.error("Failed to add item (itemService.addItem returned null): Name='{}', Number={}", newItem.getName(), newItemNumber);
                    failedCount++;
                    // Decrement nextCode because the current number was not successfully used
                    nextCode--;
                }

            } catch (Exception e) {
                // Catch errors during item creation/parsing itself
                logger.error("Failed processing AI item: {} | Error: {}", aiItem, e.getMessage(), e);
                failedCount++;
                // Ensure nextCode is decremented if itemNumber assignment was attempted but failed before adding
                if (newItemId == null) {
                    nextCode--;
                }
            }
        }
        logger.info("Finished processing batch: Added={}, Failed={}", addedCount, failedCount);
        return Map.of("added", addedCount, "failed", failedCount);
    }

    private List<Map<String, Object>> callZhipuAI(String input) throws IOException {
        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(API_TIMEOUT_MS)
                .setConnectionRequestTimeout(API_TIMEOUT_MS)
                .setSocketTimeout(API_TIMEOUT_MS).build();
        HttpClient client = HttpClients.custom().setDefaultRequestConfig(config).build();

        HttpPost request = new HttpPost(ZHIPU_API_URL);

        request.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + ZHIPU_API_KEY);
        request.setHeader(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");

        // Corrected JSON examples in prompt string AND added quantity extraction
        String prompt = String.format(
            "任务：从下面的用户输入文本中提取物品信息，并生成JSON数组。\n" +
            "背景：用户输入的是关于物品的自然语言描述，可能包含多个物品及其数量和属性。\n" +
            "要求：\n" +
            "1. **识别物品**: 找出文本中描述的所有独立物品。\n" +
            "2. **提取属性**: 对于每个物品，提取或推断以下属性：\n" +
            "   - `name` (string, 必需): 物品的核心名称。\n" +
            "   - `quantity` (integer, 必需): 物品的数量。如果用户未提及，默认为 0。\n" +
            "   - `unit` (string, 必需): 物品的计量单位。如果用户未提及，请根据物品名称推断。\n" +
            "   - `specification` (string, 必需): 物品的规格、品牌或型号。如果未提及，请设为 '普通'。\n" +
            "   - `threshold` (integer, 必需): 库存阈值。如果用户未明确提及，则默认为 10。\n" +
            "   - `startNumber` (integer, 可选): 如果用户指定了编号要求（例如'编号从88开始'），提取起始编号。只在第一个物品对象中包含此字段（如果指定）。\n" +
            "3. **忽略无关信息**: 忽略如 '我今天买了', '还有' 等非物品描述信息。\n" +
            "4. **输出格式**: 必须以严格的JSON数组格式返回结果，数组中包含每个物品信息的JSON对象。不要包含任何其他文字、解释或代码块标记。\n" +
            "\n" +
            "示例:\n" +
            "输入: '我今天买了2个logi鼠标，阈值为5，还有一个普通的键盘。'\n" +
            "输出: [{\"name\":\"鼠标\",\"quantity\":2,\"unit\":\"个\",\"specification\":\"logi\",\"threshold\":5}, {\"name\":\"键盘\",\"quantity\":0,\"unit\":\"个\",\"specification\":\"普通\",\"threshold\":10}]\n" +
            "\n" +
            "输入: '请添加10个梨、5个苹果、12个香蕉，它们的编号从88开始'\n" +
            "输出: [{\"name\":\"梨\",\"quantity\":10,\"unit\":\"个\",\"specification\":\"普通\",\"threshold\":10,\"startNumber\":88}, {\"name\":\"苹果\",\"quantity\":5,\"unit\":\"个\",\"specification\":\"普通\",\"threshold\":10}, {\"name\":\"香蕉\",\"quantity\":12,\"unit\":\"个\",\"specification\":\"普通\",\"threshold\":10}]\n" +
            "\n" +
            "输入: '50 台联想 ThinkStation P360 图形工作站；20 套希沃教室系统；10 台 H3C E552C-PWR 48 口交换机；还有一些NVIDIA 4090显卡，交换机的库存阈值为5'\n" +
            "输出: [{\"name\":\"图形工作站\",\"quantity\":50,\"unit\":\"台\",\"specification\":\"联想 ThinkStation P360\",\"threshold\":10}, {\"name\":\"教室系统\",\"quantity\":20,\"unit\":\"套\",\"specification\":\"希沃\",\"threshold\":10}, {\"name\":\"交换机\",\"quantity\":10,\"unit\":\"台\",\"specification\":\"H3C E552C-PWR 48 口\",\"threshold\":5}, {\"name\":\"显卡\",\"quantity\":0,\"unit\":\"块\",\"specification\":\"NVIDIA 4090\",\"threshold\":10}]\n" +
            "\n" +
            "-----\n" +
            "用户输入文本:\n\"%s\"\n" +
            "-----\n" +
            "JSON输出:",
            input
        );

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", "glm-4");
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        requestBodyMap.put("messages", messages);
        requestBodyMap.put("temperature", 0.01);
        requestBodyMap.put("stream", false);

        String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);
        request.setEntity(new StringEntity(requestBodyJson, StandardCharsets.UTF_8));

        logger.debug("Sending request to Zhipu AI: {}", requestBodyJson);

        HttpResponse response = client.execute(request);
        HttpEntity entity = response.getEntity();
        String responseString = EntityUtils.toString(entity, StandardCharsets.UTF_8);
        int statusCode = response.getStatusLine().getStatusCode();

        logger.debug("Received response from Zhipu AI (Status: {}): {}", statusCode, responseString);

        if (statusCode != 200) {
            logger.error("Zhipu AI request failed with status: {} Body: {}", statusCode, responseString);
            throw new IOException("Zhipu AI request failed with status: " + statusCode);
        }

        JsonNode rootNode = objectMapper.readTree(responseString);
        JsonNode choices = rootNode.path("choices");
        if (choices.isMissingNode() || !choices.isArray() || choices.isEmpty()) {
             logger.error("Invalid response format from Zhipu AI: 'choices' array missing or empty. Response: {}", responseString);
            return Collections.emptyList();
        }
        JsonNode messageNode = choices.get(0).path("message").path("content");
        if (messageNode.isMissingNode() || !messageNode.isTextual()) {
             logger.error("Invalid response format from Zhipu AI: 'message.content' missing or not text. Response: {}", responseString);
             return Collections.emptyList();
        }
        String content = messageNode.asText();
        logger.debug("Extracted content from AI response: {}", content);

        Matcher matcher = JSON_ARRAY_PATTERN.matcher(content);
        if (matcher.find()) {
            String jsonArrayString = matcher.group();
            logger.debug("Extracted JSON array string: {}", jsonArrayString);
            try {
                return objectMapper.readValue(jsonArrayString, new TypeReference<List<Map<String, Object>>>() {});
            } catch (Exception e) {
                 logger.error("Failed to parse JSON array extracted from AI response: {}", jsonArrayString, e);
                 return Collections.emptyList();
            }
        } else {
            logger.warn("Could not find JSON array pattern in AI response content: {}", content);
            return Collections.emptyList();
        }
    }

    /**
     * 生成仓库动态AI日报
     * 
     * @return AI生成的日报内容
     * @throws IOException 调用AI服务时可能发生的异常
     */
    public String generateDailyReport() throws IOException {
        logger.info("开始生成仓库动态AI日报");
        
        // 获取仪表盘数据作为日报分析的基础数据
        DashboardSummaryVO dashboardData = dashboardService.getDashboardSummary();
        
        // 准备AI提示，包含仪表盘数据
        String prompt = prepareReportPrompt(dashboardData);
        
        // 调用智谱API生成日报
        String dailyReport = callZhipuAIForReport(prompt);
        logger.info("AI日报生成完成");
        
        return dailyReport;
    }
    
    /**
     * 准备用于生成日报的AI提示
     * 
     * @param data 仪表盘数据
     * @return 格式化后的提示内容
     */
    private String prepareReportPrompt(DashboardSummaryVO data) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("任务：分析以下仓库数据，生成一份简洁、专业的日报，总结当日仓库情况和值得关注的事项。\n\n");
        promptBuilder.append("仓库数据：\n");
        
        // 添加核心指标
        promptBuilder.append("1. 物品种类总数: ").append(data.getTotalItemCount()).append("\n");
        promptBuilder.append("2. 总库存量: ").append(data.getTotalStockQuantity()).append("\n");
        promptBuilder.append("3. 低库存物品数: ").append(data.getLowStockItemCount()).append("\n");
        promptBuilder.append("4. 今日操作次数: ").append(data.getTodayTransactionCount()).append("\n\n");
        
        // 添加库存TOP物品
        promptBuilder.append("5. 库存量Top物品:\n");
        if (data.getTopItemsByStock() != null && !data.getTopItemsByStock().isEmpty()) {
            for (Map<String, Object> item : data.getTopItemsByStock()) {
                promptBuilder.append("   - ").append(item.get("name")).append(": ")
                             .append(item.get("quantity")).append("\n");
            }
        } else {
            promptBuilder.append("   (无数据)\n");
        }
        promptBuilder.append("\n");
        
        // 添加近期趋势
        promptBuilder.append("6. 近7日出入库趋势:\n");
        if (data.getRecentTransactionTrend() != null && !data.getRecentTransactionTrend().isEmpty()) {
            for (Map<String, Object> trend : data.getRecentTransactionTrend()) {
                promptBuilder.append("   - ").append(trend.get("date"))
                             .append(" 入库: ").append(trend.get("in"))
                             .append(" 出库: ").append(trend.get("out")).append("\n");
            }
        } else {
            promptBuilder.append("   (无数据)\n");
        }
        promptBuilder.append("\n");
        
        // 添加低库存物品
        promptBuilder.append("7. 低库存预警物品:\n");
        if (data.getLowStockItems() != null && !data.getLowStockItems().isEmpty()) {
            for (ItemVO item : data.getLowStockItems()) {
                promptBuilder.append("   - ").append(item.getName())
                             .append(" (当前库存: ").append(item.getStockQuantity())
                             .append(", 阈值: ").append(item.getThreshold()).append(")\n");
            }
        } else {
            promptBuilder.append("   (无预警物品)\n");
        }
        promptBuilder.append("\n");
        
        // 指定日报格式要求
        promptBuilder.append("要求：\n");
        promptBuilder.append("1. 使用标准Markdown语法\n");
        promptBuilder.append("2. 使用\"# 仓库动态日报\"作为一级标题\n");
        promptBuilder.append("3. 使用\"## 总体概况\"作为二级标题，简要总结当天仓库状态\n");
        promptBuilder.append("4. 使用\"## 库存亮点\"作为二级标题，分析库存量最高的物品和特点\n");
        promptBuilder.append("5. 使用\"## 预警信息\"作为二级标题，重点提示低库存物品情况\n");
        promptBuilder.append("6. 使用\"## 趋势分析\"作为二级标题，分析近7日出入库走势\n");
        promptBuilder.append("7. 使用\"## 建议行动\"作为二级标题，提出1-3条基于数据的具体的建设性建议\n");
        promptBuilder.append("8. 关键数据使用**粗体**突出显示\n");
        promptBuilder.append("9. 使用清晰、专业的语言，适合商业环境阅读\n");
        promptBuilder.append("10. 总字数控制在600字以内\n");
        
        return promptBuilder.toString();
    }
    
    /**
     * 调用智谱AI生成日报
     * 
     * @param prompt 准备好的提示内容
     * @return AI生成的日报文本
     * @throws IOException 调用API时可能发生的异常
     */
    private String callZhipuAIForReport(String prompt) throws IOException {
        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(API_TIMEOUT_MS)
                .setConnectionRequestTimeout(API_TIMEOUT_MS)
                .setSocketTimeout(API_TIMEOUT_MS).build();
        HttpClient client = HttpClients.custom().setDefaultRequestConfig(config).build();

        HttpPost request = new HttpPost(ZHIPU_API_URL);

        request.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + ZHIPU_API_KEY);
        request.setHeader(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", "glm-4");
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        requestBodyMap.put("messages", messages);
        requestBodyMap.put("temperature", 0.3); // 稍微降低随机性，保持日报风格稳定
        requestBodyMap.put("stream", false);

        String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);
        request.setEntity(new StringEntity(requestBodyJson, StandardCharsets.UTF_8));

        logger.debug("发送日报生成请求到智谱AI: {}", requestBodyJson);

        HttpResponse response = client.execute(request);
        HttpEntity entity = response.getEntity();
        String responseString = EntityUtils.toString(entity, StandardCharsets.UTF_8);
        int statusCode = response.getStatusLine().getStatusCode();

        logger.debug("收到智谱AI响应 (状态码: {}): {}", statusCode, responseString);

        if (statusCode != 200) {
            logger.error("智谱AI请求失败，状态码: {} 响应内容: {}", statusCode, responseString);
            throw new IOException("智谱AI请求失败，状态码: " + statusCode);
        }

        JsonNode rootNode = objectMapper.readTree(responseString);
        JsonNode choices = rootNode.path("choices");
        if (choices.isMissingNode() || !choices.isArray() || choices.isEmpty()) {
            logger.error("无效的智谱AI响应格式: 'choices'数组缺失或为空。响应: {}", responseString);
            return "生成日报失败：AI服务返回格式异常";
        }
        JsonNode messageNode = choices.get(0).path("message").path("content");
        if (messageNode.isMissingNode() || !messageNode.isTextual()) {
            logger.error("无效的智谱AI响应格式: 'message.content'缺失或非文本。响应: {}", responseString);
            return "生成日报失败：AI服务返回内容异常";
        }
        
        return messageNode.asText();
    }
}
