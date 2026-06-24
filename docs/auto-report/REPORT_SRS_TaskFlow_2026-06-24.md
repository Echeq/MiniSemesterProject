# Software Requirement Specification — TaskFlow

**Authors:** @goanarbolkong, @MemerZxZ, @Echeq
**Date:** 2026-06-24

---

## 1. 引言 (Introduction)

### 1.1 目的 (Purpose)

本文档旨在全面定义 TaskFlow 软件的需求规格。TaskFlow 是一个实时看板（Kanban）应用，基于 React 19 和 Supabase 构建，支持协作任务管理。本文档面向开发团队、测试人员及项目干系人，明确系统的功能与非功能需求，确保开发过程有序可控。

### 1.2 范围 (Scope)

TaskFlow 的范围包括：

- **功能范围**：用户认证（注册/登录/注销）、看板列管理（To Do / Doing / Done）、任务 CRUD（创建/读取/更新/删除）、拖拽排序（@dnd-kit）、实时同步（Supabase Realtime）、角色系统（admin/member/unknown）、项目管理（创建/归档/删除）、团队邀请、在线状态（Presence）、智能视图（My Tasks / Due Soon / Overdue）、主题切换（亮色/暗色）、国际化（4 种语言）、数据导出（XLSX/PDF）、头像上传。
- **非功能范围**：安全性（RLS、列级权限）、性能（实时更新延迟 < 500ms）、可维护性（迁移即真理）、可用性（响应式布局）。
- **排除范围**：无自定义后端服务器、无第三方集成 API、无离线模式。

### 1.3 定义、缩写和简写 (Definitions & Abbreviations)

| 缩写 | 全称 | 中文解释 |
|------|------|----------|
| SRS | Software Requirements Specification | 软件需求规格说明书 |
| RLS | Row-Level Security | 行级安全策略 |
| RPC | Remote Procedure Call | 远程过程调用 |
| CRUD | Create, Read, Update, Delete | 增删改查 |
| UI | User Interface | 用户界面 |
| API | Application Programming Interface | 应用程序接口 |
| JWT | JSON Web Token | JSON 网络令牌 |
| UUID | Universally Unique Identifier | 通用唯一标识符 |
| SPA | Single-Page Application | 单页应用 |
| DnD | Drag and Drop | 拖拽 |
| i18n | Internationalization | 国际化 |
| E-R | Entity-Relationship | 实体-关系 |

### 1.4 参考文献 (References)

| 文档 | 描述 |
|------|------|
| `docs/architecture.md` | 系统架构文档 |
| `docs/database.md` | 数据库表结构、枚举、RLS 策略与迁移 |
| `docs/api.md` | API 端点与 Realtime 订阅说明 |
| `AGENTS.md` | OpenCode 工作流指令 |
| `README.md` | 项目概览与快速开始 |

---

## 2. 总体描述 (General Description)

### 2.1 产品前景 (Software Perspective)

TaskFlow 是一个实时协作看板应用，基于 **React 19 SPA + Supabase** 架构。没有自定义后端服务器——前端通过 `@supabase/supabase-js` 直接与 Supabase 通信，使用 PostgREST REST API 进行 CRUD 操作，使用 Supabase Realtime WebSocket 实现实时同步。

**目标用户**：小型团队、学生、自由职业者，需要一个轻量级、实时同步的任务管理工具。

**差异化特性**：
- 实时同步：所有客户端之间通过 WebSocket 实现即时更新
- 拖拽看板：基于 @dnd-kit 的直观列与卡片拖拽
- 角色系统：admin（完全 CRUD）、member（只读+自身任务）、unknown（邀请流程）
- 智能视图：My Tasks、Due Soon、Overdue 客户端过滤
- 无服务器架构：仅使用 Supabase，无需管理自定义后端

### 2.2 产品环境 (Product Environment)

| 维度 | 环境 |
|------|------|
| **运行时** | 现代浏览器（Chrome / Firefox / Edge / Safari 最新版） |
| **开发环境** | Node.js 20+, npm, Vite 8 dev server |
| **后端服务** | Supabase Cloud（Auth / PostgREST / Realtime / Storage） |
| **可选** | Supabase CLI 用于本地开发（`supabase start`） |
| **包管理** | 所有依赖在 `frontend/` 目录下安装 |

### 2.3 软件功能 (Software Functions)

TaskFlow 提供以下主要功能：

| 功能模块 | 描述 |
|----------|------|
| **用户认证** | 注册、登录、注销；会话管理 via Supabase Auth |
| **看板视图** | 三列看板：To Do / Doing / Done；按 position 排序 |
| **任务管理** | 创建、编辑、删除任务；支持标题、描述、截止日期、负责人 |
| **拖拽排序** | 卡片在列内和跨列拖拽（@dnd-kit）；自动计算 position |
| **实时同步** | 所有客户端通过 WebSocket 接收即时更新 |
| **在线状态** | 通过 Supabase Realtime Presence 显示在线用户 |
| **角色系统** | Admin（完全 CRUD）、Member（只读+自身任务）、Unknown（邀请流程） |
| **项目管理** | 创建、编辑、归档、删除项目；项目级过滤 |
| **团队邀请** | Admin 通过邮件邀请用户，指定角色 |
| **智能视图** | My Tasks（分配给我的）、Due Soon（7天内到期）、Overdue（已过期） |
| **主题切换** | 亮色/暗色主题，基于 CSS 自定义属性 + `[data-theme]` |
| **国际化** | 4 种语言：en / es / zh / id；存储在 localStorage |
| **数据导出** | 导出看板为 XLSX 或 PDF |
| **头像管理** | 上传/更新个人头像 via Supabase Storage |

### 2.4 用户特征 (User Characteristics)

| 角色 | 特征 | 权限 |
|------|------|------|
| **Unknown** | 未登录或刚注册但尚未被邀请的用户 | 看到空看板 + 邀请流程引导；无任务访问权限 |
| **Member** | 团队成员 | 只读访问被分配的任务；可更新自身的 display_name 和 avatar |
| **Admin** | 团队管理员 | 完全 CRUD 所有任务和项目；可管理角色、邀请成员、归档项目 |

**引导机制**：第一个注册用户自动成为 Admin（Bootstrap 机制），确保团队始终有管理员。

### 2.5 假设与依赖 (Assumptions & Dependencies)

- **网络**：用户需持续连接互联网以使用 Realtime 同步
- **浏览器**：支持 ES2022+、WebSocket、CSS Grid/Flexbox 的现代浏览器
- **Supabase**：项目需配置有效的 Supabase URL 和 Anon Key
- **开发环境**：Node.js 20+ 用于本地开发
- **外部依赖**：仅依赖 Supabase（auth、数据库、realtime、storage）；无其他第三方后端服务

---

## 3. 用例模型 (Use Case Model)

### 3.1 用例图 (Use Case Diagram)

**Figure 3.1 — TaskFlow Use Case Diagram**
*(Insert image here: use-case-diagram.png)*

**角色 (Actors)**：
- **Admin** — 完全访问权限
- **Member** — 有限访问权限（仅自身任务）
- **Unknown** — 无访问权限
- **Supabase** — 外部系统（Auth / Realtime / Storage）

### 3.2 用例描述 (Use Case Descriptions)

| 编号 | 用例名称 | 角色 | 描述 |
|------|----------|------|------|
| UC-01 | 注册账户 | Unknown | 用户通过邮箱和密码注册；第一个用户自动成为 Admin |
| UC-02 | 登录 | Unknown, Member, Admin | 用户通过邮箱和密码登录 |
| UC-03 | 注销 | Member, Admin | 用户退出当前会话 |
| UC-04 | 查看看板 | Member, Admin | 查看看板中的所有任务（Admin：全部；Member：仅分配的任务） |
| UC-05 | 创建任务 | Admin | 在看板中创建新任务（含标题、描述、截止日期、负责人、项目） |
| UC-06 | 编辑任务 | Admin | 修改任务标题、描述、状态、截止日期、position、负责人、项目 |
| UC-07 | 删除任务 | Admin | 从看板中删除任务 |
| UC-08 | 拖拽排序 | Admin | 在同列内拖拽重排，或跨列移动任务 |
| UC-09 | 管理项目 | Admin | 创建、编辑（名称/颜色/图标）、归档、删除项目 |
| UC-10 | 邀请成员 | Admin | 通过邮件邀请用户，指定其为 Member 或 Admin |
| UC-11 | 管理角色 | Admin | 更改用户角色（admin/member），但不能更改自身角色 |
| UC-12 | 使用智能视图 | Member, Admin | 按 My Tasks / Due Soon / Overdue 过滤任务 |
| UC-13 | 切换主题 | Member, Admin | 在亮色和暗色主题间切换 |
| UC-14 | 切换语言 | Member, Admin | 在 4 种支持的语言间切换 |
| UC-15 | 导出数据 | Member, Admin | 导出看板为 XLSX 或 PDF |
| UC-16 | 上传头像 | Member, Admin | 上传个人头像到 Supabase Storage |
| UC-17 | 删除账户 | Member, Admin | 用户删除自身账户及其所有数据 |

---

## 4. 具体需求 (Specific Requirements)

### 4.1 功能需求 (Functional Requirements)

#### F.1 — 用户认证模块

| 需求 ID | 需求名称 | 描述 | 优先级 |
|---------|----------|------|--------|
| F.AUTH.001 | 用户注册 | 用户通过邮箱+密码注册；第一个用户自动获得 admin 角色 | A |
| F.AUTH.002 | 用户登录 | 用户通过邮箱+密码登录系统 | A |
| F.AUTH.003 | 用户注销 | 用户退出当前会话 | A |
| F.AUTH.004 | 会话恢复 | 页面刷新时自动恢复已有会话 | A |
| F.AUTH.005 | 删除账户 | 用户可删除自身账户（含级联删除任务、项目）；最后一名 admin 不可删除 | A |

#### F.2 — 任务管理模块

| 需求 ID | 需求名称 | 描述 | 优先级 |
|---------|----------|------|--------|
| F.TASK.001 | 创建任务 | Admin 创建任务（title 1-200字, description ≤5000字, due_date, status, assignee, project_id） | A |
| F.TASK.002 | 查看任务 | 按 position 排序查看任务（Admin：全部；Member：仅被分配的任务） | A |
| F.TASK.003 | 更新任务 | Admin 更新任务字段（title, description, status, due_date, position, assignee, project_id） | A |
| F.TASK.004 | 删除任务 | Admin 从看板删除任务 | A |
| F.TASK.005 | 三列看板 | 任务按状态分为 To Do / Doing / Done 三列 | A |
| F.TASK.006 | 拖拽重排 | 在同列内拖拽改变 task position；跨列拖拽改变 status + position | A |
| F.TASK.007 | 智能视图 | 客户端过滤：My Tasks（assignee=当前用户）、Due Soon（≤7天）、Overdue（已过期且未完成） | B |

#### F.3 — 项目与角色模块

| 需求 ID | 需求名称 | 描述 | 优先级 |
|---------|----------|------|--------|
| F.PROJ.001 | 创建项目 | Admin 创建项目（名称、描述、颜色、图标）；创建者自动成为项目 Admin | A |
| F.PROJ.002 | 编辑项目 | Admin 或创建者编辑项目名称和描述；仅 Admin 可更改项目状态（active/archived） | A |
| F.PROJ.003 | 删除项目 | 仅 Admin 可删除项目 | B |
| F.PROJ.004 | 切换项目 | 用户在项目间切换，或查看 All Tasks / Shared Board | A |
| F.ROLE.001 | 分配角色 | Admin 通过 admin_set_role RPC 更改用户角色，不能更改自身角色 | A |
| F.ROLE.002 | 邀请成员 | Admin 通过邮件邀请用户，指定角色（admin/member） | B |
| F.ROLE.003 | 项目成员 | Admin 管理项目的成员及其角色 | B |

#### F.4 — 其他功能

| 需求 ID | 需求名称 | 描述 | 优先级 |
|---------|----------|------|--------|
| F.OTHER.001 | 数据导出 | 看板导出为 XLSX（jsPDF）或 PDF（jspdf） | C |
| F.OTHER.002 | 头像上传 | 用户上传/更新个人头像到 Supabase Storage bucket avatars | C |
| F.OTHER.003 | 主题切换 | 亮色/暗色主题切换，持久化到 localStorage key `taskflow-theme` | C |
| F.OTHER.004 | 语言切换 | 4 种语言（en/es/zh/id）切换，持久化到 localStorage key `lang` | C |

### 4.2 非功能需求 (Non-functional Requirements)

| 需求 ID | 需求名称 | 描述 | 优先级 |
|---------|----------|------|--------|
| NF.SEC.001 | 行级安全 | 所有查询以已登录用户身份执行；Admin 见全部，Member 见被分配的任务 | A |
| NF.SEC.002 | 列级权限 | `created_by` 不可变；仅特定字段可通过 `grant update` 更新 | A |
| NF.SEC.003 | RPC 安全 | 关键操作（角色更改、项目归档、账户删除）通过 SECURITY DEFINER RPC 执行，含权限检查 | A |
| NF.PORT.001 | 跨浏览器 | 支持 Chrome / Firefox / Edge / Safari 最新版本 | B |
| NF.PORT.002 | 响应式 | 移动端自适应布局，列垂直堆叠 | B |
| NF.I18N.001 | 国际化 | 支持 en / es / zh / id 四种语言，fallback 为英语 | B |
| NF.MAINT.001 | DB 迁移即真理 | 所有 schema 变更通过 `supabase/migrations/` SQL 文件管理 | A |
| NF.MAINT.002 | 无自定义后端 | 无自定义 Node.js/NestJS 服务器；仅使用 Supabase | A |

### 4.3 性能需求 (Performance Requirements)

| 指标 | 目标值 |
|------|--------|
| 页面初次加载 | < 2s（Vite 构建生产包） |
| Realtime 更新延迟 | < 500ms（WebSocket 推送） |
| CRUD 操作响应 | < 1s |
| 拖拽反馈 | < 100ms（乐观更新 + positionBetween 计算） |
| 并发用户 | 无明确限制（Supabase 可水平扩展） |
| Seed 数据 | `supabase/seed.sql` 幂等执行，跳过已有数据 |

### 4.4 接口需求 (Interface Requirements)

#### 用户界面 (User Interface)

| 组件 | 技术 | 描述 |
|------|------|------|
| 框架 | React 19 + JSX | 函数式组件 + hooks |
| 样式 | Tailwind CSS v4 | 实用优先的 CSS 框架 |
| 主题 | CSS 自定义属性 + `[data-theme]` | 亮色/暗色切换 |
| 拖拽 | @dnd-kit (core@6, sortable@10, utilities@3) | 卡片和列拖拽 |
| 图标 | SVG inline | 自定义 SVG 图标 |

#### 软件接口 (Software Interface)

| 接口 | 协议/格式 | 描述 |
|------|-----------|------|
| Supabase Auth | REST (JWT) | 用户认证、会话管理 |
| Supabase PostgREST | REST (JSON) | CRUD over HTTP |
| Supabase Realtime | WebSocket (Postgres Changes) | 实时任务更新 |
| Supabase Storage | REST | 头像文件上传/读取 |
| Supabase Realtime Presence | WebSocket | 在线用户状态 |

#### 硬件接口 (Hardware Interface)

无直接硬件接口。运行于标准 Web 浏览器环境。

#### 通信接口 (Communication Interface)

| 协议 | 用途 |
|------|------|
| HTTPS | 安全 REST API 通信 |
| WSS (WebSocket Secure) | Realtime 数据推送 |
| TCP/IP | 底层网络传输 |

---

## 5. 总体设计约束 (Overall Design Constraints)

### 5.1 标准符合性 (Standards Compliance)

| 标准 | 描述 |
|------|------|
| IEEE 830-1998 | 软件需求规格说明书模板参考 |
| ECMAScript 2022+ | JavaScript 语言标准 |
| CSS Grid / Flexbox | 布局标准 |
| WebSocket (RFC 6455) | 实时通信标准 |
| JWT (RFC 7519) | 认证令牌标准 |

### 5.2 硬件限制 (Hardware Limitations)

- **浏览器端**：支持 ES2022+ 的现代设备。建议 ≥ 4GB RAM。
- **移动端**：Android 6+ / iOS 12+。
- **无服务器端硬件限制**：后端由 Supabase 管理。

### 5.3 技术限制 (Technology Limitations)

| 约束 | 说明 |
|------|------|
| **React 19** | 必须使用 React 19.x，hooks 模式 |
| **Vite 8** | 构建工具限定为 Vite 8 |
| **Tailwind 4** | 样式框架限定 Tailwind CSS v4 |
| **@dnd-kit** | 指定版本：core@6, sortable@10, utilities@3（跨大版本不兼容） |
| **Supabase** | 后端限定 Supabase，无自定义服务器 |
| **TypeScript** | tsconfig 仅用于工具类型检查；源代码为 JSX |
| **DB 迁移** | 所有 schema 变更必须通过 `supabase/migrations/` SQL 文件 |
| **无 CI/CD** | 无配置的 CI 工作流；无 lint/typecheck 脚本 |

---

## 6. 软件质量属性 (Software Quality Attributes)

### 6.1 可靠性 (Reliability)

- 实时同步失败时自动重试：Realtime INSERT/UPDATE 事件触发单行 re-fetch（含 assignee 联表查询），确保数据一致
- 乐观更新：UI 立即反映更改，后台异步提交；排序/状态变更时在本地排序
- Supabase 冗余：Supabase 服务高可用，数据库自动备份

### 6.2 易用性 (Usability)

- 拖拽交互：直观的拖拽重排和跨列移动
- 智能视图：一键过滤个人任务、即将到期和已过期的任务
- 响应式设计：桌面与移动端自适应布局
- 国际化：支持中、英、西、印尼四种语言
- 主题切换：亮色/暗色主题，跟随系统偏好

### 6.3 可维护性 (Maintainability)

- DB 迁移作为唯一真理源：所有 schema 变更通过 SQL 迁移文件管理
- Supabase MCP 预配置：Agent 可通过 `opencode.json` 中的 Supabase MCP 直接运行 SQL
- AGENTS.md 指令文件：为 AI Agent 提供完整的上下文
- 死代码标记：`backend/`（废弃 NestJS 脚手架）、`composables/`、`assets/`（空的 Vue 3 遗留物）明确标注不可修改

### 6.4 安全性 (Security)

| 机制 | 描述 |
|------|------|
| **RLS 策略** | Admin 见全部任务；Member 仅见分配任务；Unknown 无权限 |
| **列级权限** | `created_by` 等不可变字段通过 `revoke update`+`grant update (specific cols)` 保护 |
| **RPC 安全** | `admin_set_role`, `set_project_status`, `delete_own_account` 均为 SECURITY DEFINER，含权限检查 |
| **角色自锁** | Admin 无法更改自身角色（防止误操作导致团队无管理员） |
| **最后 Admin 保护** | 删除最后一名 Admin 账户被拒绝 |
| **邀请系统** | 仅 Admin 可创建/管理邀请；签名后自动消费并分配角色 |

---

## 7. 需求分类 (Requirements Classification)

| 优先级 | 含义 | 包含需求 |
|--------|------|----------|
| **A** — 关键 | 系统必须实现 | 认证、任务 CRUD、拖拽、角色系统、RLS、项目管理、Realtime |
| **B** — 重要 | 核心体验但可延期 | 智能视图、邀请系统、项目成员、国际化、响应式、数据导出 |
| **C** — 锦上添花 | 锦上添花 | 头像上传、主题切换、高级导出 |

---

## 8. 附录 (Appendix)

### 8.1 数据库 E-R 图 (Database E-R Diagram)

**Figure 8.1 — Database Entity-Relationship Diagram**
*(Insert image here: database-er-diagram.png)*

### 8.2 缩写表 (Abbreviations Table)

| 缩写 | 全称 | 中文解释 |
|------|------|----------|
| SRS | Software Requirements Specification | 软件需求规格说明书 |
| RLS | Row-Level Security | 行级安全策略 |
| RPC | Remote Procedure Call | 远程过程调用 |
| CRUD | Create, Read, Update, Delete | 增删改查 |
| JWT | JSON Web Token | JSON 网络令牌 |
| UUID | Universally Unique Identifier | 通用唯一标识符 |
| SPA | Single-Page Application | 单页应用 |
| DnD | Drag and Drop | 拖拽 |
| i18n | Internationalization | 国际化 |
| FK | Foreign Key | 外键 |
| ERD | Entity-Relationship Diagram | 实体关系图 |

---

*End of document — Software Requirement Specification — TaskFlow v1.0*
