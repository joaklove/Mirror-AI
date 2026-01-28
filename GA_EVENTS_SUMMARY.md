# Mirror AI - GA 事件追踪快速清单

## 📊 总览
- **总事件数**: 47 个
- **事件分类**: 12 个类别
- **状态**: ✅ 已全部实现

---

## 🎯 完整事件列表

### 1️⃣ 日记管理 (5 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 1 | `journal_create` | 创建日记 | P0 |
| 2 | `journal_delete` | 删除日记 | P1 |
| 3 | `data_export` | 导出数据 | P1 |
| 4 | `data_clear_all` | 清空所有数据 | P1 |
| 5 | `data_migrate` | 本地数据迁移到云端 | P1 |

### 2️⃣ AI 功能 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 6 | `generate_report` | 开始生成晨报 | P0 |
| 7 | `report_generated` | 晨报生成成功 | P0 |
| 8 | `report_error` | 晨报生成失败 | P1 |
| 9 | `ai_config_save` | 保存 AI 配置 | P1 |

### 3️⃣ 用户认证 (3 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 10 | `sign_up` | 用户注册 | P0 |
| 11 | `sign_in` | 用户登录 | P0 |
| 12 | `sign_out` | 用户登出 | P0 |

### 4️⃣ 设置交互 (2 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 13 | `settings_open` | 打开设置 | P2 |
| 14 | `settings_close` | 关闭设置 | P2 |

### 5️⃣ 用户交互 (3 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 15 | `view_report` | 查看晨报 | P1 |
| 16 | `close_report` | 关闭晨报 | P2 |
| 17 | `keyboard_shortcut` | 使用快捷键 | P3 |

### 6️⃣ 用户留存与活跃度 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 18 | `daily_visit` | 每日访问 | P0 |
| 19 | `streak_days` | 连续打卡天数 | P3 |
| 20 | `weekly_active` | 每周活跃 | P1 |
| 21 | `session_duration` | 会话时长 | P2 |

### 7️⃣ 内容质量 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 22 | `entry_word_count` | 日记字数分析 | P2 |
| 23 | `tag_usage` | 标签使用统计 | P2 |
| 24 | `emotion_trend` | 情绪标签趋势 | P2 |
| 25 | `entry_frequency` | 日记频率统计 | P2 |

### 8️⃣ AI 使用深度 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 26 | `report_view_duration` | 晨报查看时长 | P2 |
| 27 | `model_switch` | AI 模型切换 | P3 |
| 28 | `api_success_rate` | API 调用成功率 | P1 |
| 29 | `report_frequency` | 晨报使用频率 | P2 |

### 9️⃣ 转化漏斗 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 30 | `first_entry_created` | 首篇日记 | P0 ⭐ |
| 31 | `first_report_generated` | 首次生成晨报 | P0 ⭐ |
| 32 | `setup_completed` | 完成配置 | P0 ⭐ |
| 33 | `milestone_reached` | 达到里程碑 | P2 |

### 🔟 功能发现 (3 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 34 | `feature_discovered` | 发现功能 | P2 |
| 35 | `feature_first_use` | 首次使用功能 | P2 |
| 36 | `feature_usage` | 功能使用次数 | P2 |

### 1️⃣1️⃣ 错误追踪 (7 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 37 | `error_occurred` | 任何错误发生 | P1 |
| 38 | `data_load_failed` | 数据加载失败 | P1 |
| 39 | `network_error` | 网络请求失败 | P1 |
| 40 | `config_invalid` | 配置验证失败 | P1 |
| 41 | Create Entry Failed | 创建日记失败 | P1 |
| 42 | Delete Entry Failed | 删除日记失败 | P1 |
| 43 | Generate Report Failed | 生成晨报失败 | P1 |

### 1️⃣2️⃣ 性能监控 (4 个事件)
| # | 事件名称 | 触发时机 | 优先级 |
|---|---------|---------|--------|
| 44 | `page_load_time` | 页面加载完成 | P1 |
| 45 | `ai_response_time` | AI API 响应 | P1 |
| 46 | `sync_time` | 数据同步完成 | P1 |
| 47 | `database_operation` | 数据库操作完成 | P1 |

---

## 🎯 核心转化漏斗（重点关注）

```
用户注册 (sign_up)
    ↓ 激活率
首篇日记 (first_entry_created) ⭐⭐⭐⭐⭐
    ↓ 配置率
完成配置 (setup_completed) ⭐⭐⭐⭐
    ↓ 核心功能使用率
首次晨报 (first_report_generated) ⭐⭐⭐⭐⭐
    ↓ 留存
里程碑 (1/5/10/20/50/100 篇)
```

---

## 📈 关键指标计算

### 用户活跃度
- **DAU**: `daily_visit` 去重用户数
- **WAU**: `weekly_active` 去重用户数
- **MAU**: `daily_visit` 30 天去重
- **平均会话时长**: `session_duration` 平均值

### 功能使用率
- **日记创建率**: `journal_create` / `daily_visit`
- **晨报生成率**: `generate_report` / `daily_visit`
- **AI 成功率**: `report_generated` / `generate_report`

### 转化率
- **激活率**: `first_entry_created` / `sign_up`
- **配置率**: `setup_completed` / `first_entry_created`
- **核心功能使用率**: `first_report_generated` / `setup_completed`

### 内容质量
- **平均日记字数**: `entry_word_count` 平均值
- **标签分布**: `tag_usage` 各标签占比
- **日记频率**: 每周 `journal_create` 次数

### 性能指标
- **页面加载速度**: `page_load_time` 中位数
- **AI 响应速度**: `ai_response_time` 中位数
- **错误率**: `error_occurred` / 总事件数

---

## 🔍 在 GA4 中查看

### 1. 实时报告
**路径**: Google Analytics → 实时 → 事件  
**查看**: 当前正在发生的事件

### 2. 事件报告
**路径**: 报告 → 互动 → 事件  
**查看**: 所有事件统计数据

### 3. 转化漏斗
**路径**: 探索 → 路径探索  
**设置**: 
```
起点: sign_up
步骤 1: first_entry_created
步骤 2: setup_completed
步骤 3: first_report_generated
```

### 4. 自定义报告
**路径**: 探索 → 空白  
**维度**: 事件名称、日期  
**指标**: 事件计数、用户数、平均值

---

## ⚠️ 注意事项

### 数据采集延迟
- **实时数据**: 几秒延迟
- **标准报告**: 24-48 小时

### 隐私设置
- 广告拦截器可能阻止追踪
- 用户可以禁用 Cookies

### 调试方法
1. 打开 Chrome DevTools → Console
2. 查看 `[GA] Event tracked` 日志
3. 检查 Network → 搜索 `google-analytics`
4. 确认状态码为 200

---

## ✅ 实施状态

| 分类 | 事件数 | 状态 |
|------|--------|------|
| 日记管理 | 5 | ✅ 完成 |
| AI 功能 | 4 | ✅ 完成 |
| 用户认证 | 3 | ✅ 完成 |
| 设置交互 | 2 | ✅ 完成 |
| 用户交互 | 3 | ✅ 完成 |
| 用户留存 | 4 | ✅ 完成 |
| 内容质量 | 4 | ✅ 完成 |
| AI 使用深度 | 4 | ✅ 完成 |
| 转化漏斗 | 4 | ✅ 完成 |
| 功能发现 | 3 | ✅ 完成 |
| 错误追踪 | 7 | ✅ 完成 |
| 性能监控 | 4 | ✅ 完成 |
| **总计** | **47** | **✅ 100%** |

---

**GA 追踪 ID**: `G-02BYH6YYBB`  
**最后更新**: 2026-01-22  
**版本**: 2.0.0  
**状态**: ✅ 生产环境运行中
