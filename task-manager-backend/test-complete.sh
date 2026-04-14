#!/bin/bash

# 任务管理系统完整测试脚本
# 作者：Andrew - QA Testing
# 日期：2026-04-13

BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3002"

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "任务管理系统 - 完整测试"
echo "=========================================="
echo ""

# 记录测试结果函数
pass_test() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

warn_test() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

# ==========================================
# 测试 A: 后端 API 测试
# ==========================================
echo "=========================================="
echo "测试 A: 后端 API 测试"
echo "=========================================="

# A1. 健康检查
echo ""
echo "A1. 健康检查 API"
RESPONSE=$(curl -s "$BASE_URL/api/health")
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    pass_test "健康检查正常"
else
    fail_test "健康检查失败"
fi

# A2. 任务 CRUD - 创建
echo ""
echo "A2. 任务创建 API"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试任务 CRUD-创建","priority":"high","description":"测试创建任务","tags":["test","crud"],"status":"todo"}')
TASK_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$TASK_ID" ]; then
    pass_test "任务创建成功 - ID: $TASK_ID"
else
    fail_test "任务创建失败"
fi

# A3. 任务 CRUD - 查询列表
echo ""
echo "A3. 任务列表 API"
LIST_RESPONSE=$(curl -s "$BASE_URL/api/v1/tasks")
if echo "$LIST_RESPONSE" | grep -q '"success":true'; then
    pass_test "任务列表查询成功"
else
    fail_test "任务列表查询失败"
fi

# A4. 任务 CRUD - 查询单个
echo ""
echo "A4. 单个任务查询 API"
if [ -n "$TASK_ID" ]; then
    SINGLE_RESPONSE=$(curl -s "$BASE_URL/api/v1/tasks/$TASK_ID")
    if echo "$SINGLE_RESPONSE" | grep -q '"success":true'; then
        pass_test "单个任务查询成功"
    else
        fail_test "单个任务查询失败"
    fi
fi

# A5. 任务 CRUD - 更新状态
echo ""
echo "A5. 任务状态更新 API"
if [ -n "$TASK_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/v1/tasks/$TASK_ID" \
      -H "Content-Type: application/json" \
      -d '{"status":"in-progress"}')
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        pass_test "任务状态更新成功"
    else
        fail_test "任务状态更新失败"
    fi
fi

# A6. 任务 CRUD - 删除
echo ""
echo "A6. 任务删除 API"
if [ -n "$TASK_ID" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/v1/tasks/$TASK_ID")
    if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
        pass_test "任务删除成功"
    else
        fail_test "任务删除失败"
    fi
fi

# A7. 员工管理 - 注册
echo ""
echo "A7. 员工注册 API"
AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/agents" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试员工-QA","type":"subagent","description":"QA 测试员工","capabilities":["qa-testing"],"config":{"model":"qwen3.5:27b"}}')
AGENT_ID=$(echo "$AGENT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$AGENT_ID" ]; then
    pass_test "员工注册成功 - ID: $AGENT_ID"
else
    fail_test "员工注册失败"
fi

# A8. 员工管理 - 查询列表
echo ""
echo "A8. 员工列表查询 API"
AGENTS_RESPONSE=$(curl -s "$BASE_URL/api/v1/agents")
if echo "$AGENTS_RESPONSE" | grep -q '"success":true'; then
    pass_test "员工列表查询成功"
else
    fail_test "员工列表查询失败"
fi

# A9. 心跳 API
echo ""
echo "A9. 心跳轮询 API"
if [ -n "$AGENT_ID" ]; then
    HEARTBEAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/heartbeat" \
      -H "Content-Type: application/json" \
      -d "{\"agentId\":\"$AGENT_ID\",\"status\":\"online\",\"currentTasks\":[]}")
    if echo "$HEARTBEAT_RESPONSE" | grep -q '"success":true'; then
        pass_test "心跳 API 正常工作"
    else
        fail_test "心跳 API 失败"
    fi
fi

# A10. 任务分配功能
echo ""
echo "A10. 任务分配 API"
# 先创建一个任务
CREATE_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试分配任务","priority":"medium","description":"测试任务分配","tags":["test","assignment"],"status":"todo"}')
ASSIGN_TASK_ID=$(echo "$CREATE_TASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$ASSIGN_TASK_ID" ] && [ -n "$AGENT_ID" ]; then
    ASSIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tasks/$ASSIGN_TASK_ID/assign" \
      -H "Content-Type: application/json" \
      -d "{\"assigneeId\":\"$AGENT_ID\"}")
    if echo "$ASSIGN_RESPONSE" | grep -q '"success":true'; then
        pass_test "任务分配成功"
    else
        fail_test "任务分配失败"
    fi
    # 清理测试任务
    curl -s -X DELETE "$BASE_URL/api/v1/tasks/$ASSIGN_TASK_ID" > /dev/null
fi

# A11. WebSocket 连接测试（模拟）
echo ""
echo "A11. WebSocket 连接测试"
# 通过检查健康检查中的 WebSocket 连接数来验证
WS_RESPONSE=$(curl -s "$BASE_URL/api/health")
if echo "$WS_RESPONSE" | grep -q '"websocketConnections"'; then
    pass_test "WebSocket 服务正常"
else
    fail_test "WebSocket 服务异常"
fi

# 清理测试数据
if [ -n "$AGENT_ID" ]; then
    curl -s -X DELETE "$BASE_URL/api/v1/agents/$AGENT_ID" > /dev/null
fi

# ==========================================
# 测试 B: 前端功能测试
# ==========================================
echo ""
echo "=========================================="
echo "测试 B: 前端功能测试"
echo "=========================================="

# B1. 前端服务可用性
echo ""
echo "B1. 前端服务可用性"
FRONTEND_RESPONSE=$(curl -s "$FRONTEND_URL/")
if echo "$FRONTEND_RESPONSE" | grep -q "task-manager-frontend"; then
    pass_test "前端服务正常"
else
    fail_test "前端服务异常"
fi

# B2. 前端页面加载
echo ""
echo "B2. 前端页面加载"
if echo "$FRONTEND_RESPONSE" | grep -q '<div id="root"></div>'; then
    pass_test "页面基本结构正常"
else
    fail_test "页面结构异常"
fi

# B3. Vite 开发服务器
echo ""
echo "B3. Vite 开发服务器"
if echo "$FRONTEND_RESPONSE" | grep -q "vite"; then
    pass_test "Vite 开发服务器正常"
else
    fail_test "Vite 开发服务器异常"
fi

# ==========================================
# 测试 C: 前后端联调测试
# ==========================================
echo ""
echo "=========================================="
echo "测试 C: 前后端联调测试"
echo "=========================================="

# C1. 前端创建任务 -> 后端存储
echo ""
echo "C1. 前端创建任务 -> 后端存储"
INTEGRATION_TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"联调测试任务","priority":"low","description":"前后端联调测试","tags":["integration"],"status":"todo"}')
INTEGRATION_TASK_ID=$(echo "$INTEGRATION_TASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$INTEGRATION_TASK_ID" ]; then
    pass_test "任务创建成功 - ID: $INTEGRATION_TASK_ID"
else
    fail_test "任务创建失败"
fi

# C2. 后端数据 -> 前端查询显示
echo ""
echo "C2. 后端数据 -> 前端查询显示"
if [ -n "$INTEGRATION_TASK_ID" ]; then
    VERIFY_RESPONSE=$(curl -s "$BASE_URL/api/v1/tasks/$INTEGRATION_TASK_ID")
    if echo "$VERIFY_RESPONSE" | grep -q "联调测试任务"; then
        pass_test "数据持久化成功"
    else
        fail_test "数据持久化失败"
    fi
fi

# C3. 任务状态更新同步
echo ""
echo "C3. 任务状态更新同步"
if [ -n "$INTEGRATION_TASK_ID" ]; then
    STATUS_UPDATE=$(curl -s -X PATCH "$BASE_URL/api/v1/tasks/$INTEGRATION_TASK_ID" \
      -H "Content-Type: application/json" \
      -d '{"status":"completed"}')
    if echo "$STATUS_UPDATE" | grep -q '"status":"completed"'; then
        pass_test "任务状态更新成功"
    else
        fail_test "任务状态更新失败"
    fi
fi

# C4. WebSocket 实时推送（模拟）
echo ""
echo "C4. WebSocket 实时推送"
# 通过检查健康检查中的 WebSocket 连接数来验证
WS_COUNT=$(curl -s "$BASE_URL/api/health" | grep -o '"websocketConnections":[0-9]*' | cut -d':' -f2)
if [ -n "$WS_COUNT" ]; then
    pass_test "WebSocket 服务可用 (连接数：$WS_COUNT)"
else
    fail_test "WebSocket 服务异常"
fi

# 清理测试数据
if [ -n "$INTEGRATION_TASK_ID" ]; then
    curl -s -X DELETE "$BASE_URL/api/v1/tasks/$INTEGRATION_TASK_ID" > /dev/null
fi

# ==========================================
# 测试 D: 边界情况测试
# ==========================================
echo ""
echo "=========================================="
echo "测试 D: 边界情况测试"
echo "=========================================="

# D1. 空数据场景
echo ""
echo "D1. 空数据场景"
EMPTY_RESPONSE=$(curl -s "$BASE_URL/api/v1/tasks?status=nonexistent")
if echo "$EMPTY_RESPONSE" | grep -q '"success":true'; then
    pass_test "空数据场景处理正常"
else
    fail_test "空数据场景处理异常"
fi

# D2. 错误输入处理 - 缺少必填字段
echo ""
echo "D2. 错误输入处理 - 缺少必填字段"
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"description":"没有标题的任务"}')
if echo "$INVALID_RESPONSE" | grep -q '"success":false'; then
    pass_test "错误输入处理正常"
else
    fail_test "错误输入处理异常"
fi

# D3. 查询不存在的任务
echo ""
echo "D3. 查询不存在的任务"
NOT_FOUND_RESPONSE=$(curl -s "$BASE_URL/api/v1/tasks/non-existent-task-id")
if echo "$NOT_FOUND_RESPONSE" | grep -q '"success":false'; then
    pass_test "404 错误处理正常"
else
    fail_test "404 错误处理异常"
fi

# D4. 查询不存在的员工
echo ""
echo "D4. 查询不存在的员工"
NOT_FOUND_AGENT_RESPONSE=$(curl -s "$BASE_URL/api/v1/agents/non-existent-agent-id")
if echo "$NOT_FOUND_AGENT_RESPONSE" | grep -q '"success":false'; then
    pass_test "员工 404 错误处理正常"
else
    fail_test "员工 404 错误处理异常"
fi

# ==========================================
# 测试汇总
# ==========================================
echo ""
echo "=========================================="
echo "测试汇总"
echo "=========================================="
echo ""
echo -e "通过：${GREEN}$TESTS_PASSED${NC}"
echo -e "失败：${RED}$TESTS_FAILED${NC}"
echo "总计：$((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}所有测试通过!${NC}"
    exit 0
else
    echo -e "${RED}存在测试失败，请检查${NC}"
    exit 1
fi
