# 药品注册模拟系统 — 工作日志

## 版本总览

| 版本 | 日期 | 主题 | 评级 |
|------|------|------|------|
| [v1.0](#v10-初始构建) | 2026-07-15 | 初始构建 | — |
| [v1.1](#v11-pdf对标优化) | 2026-07-15 | PDF对标优化 | — |
| [v1.2](#v12-nmpa官方ui复刻) | 2026-07-15 | NMPA官方UI复刻 | — |
| [v1.3](#v13-fdaema官方ui复刻) | 2026-07-17 | FDA/EMA官方UI复刻 | — |
| [v1.4](#v14-模拟资料包) | 2026-07-17 | 模拟资料包 | — |
| [v1.5](#v15-生产部署) | 2026-07-17 | 生产部署 | — |
| [v1.6](#v16-专家评审) | 2026-07-17 | 第一次专家评审 | B+ |
| [v1.7](#v17-专家评审完善) | 2026-07-17 | 第一次评审完善 | — |
| [v1.8](#v18-操作流程审查) | 2026-07-17 | 第二次专家审查（操作流程） | 5.8→7.5+ |
| [v1.9](#v19-ctd文档模板系统) | 2026-07-20 | CTD文档模板系统 | — |

---

## v1.0 初始构建

**日期**：2026-07-15
**依据**：用户需求——构建模拟药品申报注册的网站

### 技术选型

| 层级 | 选型 | 理由 |
|------|------|------|
| 前端框架 | React 18 + TypeScript + Vite | 类型安全、HMR快速开发 |
| UI组件库 | Ant Design 5.x | 最适合中文企业级应用的组件库 |
| 状态管理 | Zustand | 轻量、TypeScript友好 |
| 路由 | React Router v6 | 标准React路由方案 |
| 后端框架 | Express.js + TypeScript | 成熟稳定的Node.js框架 |
| ORM | Prisma | 类型安全的数据库ORM |
| 数据库 | SQLite | 零配置、适合开发和小规模部署 |
| 认证 | JWT + bcrypt | 无状态认证方案 |
| 文件上传 | multer | Express标准中间件 |

### 数据库设计

- **6个核心表**：User, Application, ApplicationStage, Document, Review, Notification
- **4种用户角色**：applicant（申请人）, reviewer（审评员）, approver（审批人）, admin（管理员）
- **5种申请类型**：IND, NDA, ANDA, supplementary, renewal
- **7个审评阶段**：受理→形式审查→技术审评→现场核查→样品检验→行政审批→制证送达

### API设计

- **6组RESTful路由**：auth, applications, reviews, documents, dashboard, users
- 共23个端点

### 前端页面（9页）

| 页面 | 功能 |
|------|------|
| 登录/注册 | 用户认证 |
| 仪表盘 | 统计数据+最近动态 |
| 申请列表 | 分页表格+筛选搜索 |
| 新建申请 | 5字段表单 |
| 申请详情 | 阶段时间线+审评意见+文件管理 |
| 审评任务列表 | 双标签页（我的任务/待认领） |
| 审评详情 | 审评意见+推进操作 |
| 用户管理 | 管理员CRUD |

### 审评流程

实现7阶段线性NMPA审评流程，支持：
- 阶段推进（通过→下一阶段）
- 发补通知（暂停审评）
- 补正恢复（继续审评）
- 不予批准（终止审评）
- 自动生成受理号

### 种子数据

5个预置用户账号，覆盖所有角色。

---

## v1.1 PDF对标优化

**日期**：2026-07-15
**依据**：《中美欧常用药品注册申报流程汇编》(670页) PDF文档

### 文件变更

#### 数据库
- **新增6张表**：RegulatorySystem, EnterpriseInfo, CROInfo, PatentDeclaration, CTDModule, CTDSubModule, FDARegistration, EMARegistration
- **Application表扩展**：新增15+字段（genericName, tradeName, dosageForm, indication, usageDosage, atcCode, isOverseas, priorityReview, breakthroughTherapy, orphanDrug, emergencyUse等）

#### 后端新增
- `ctd.service.ts`：CTD模块树管理
- `fda.service.ts`：FDA特定逻辑（DUNS/FEI/ESG验证）
- `ema.service.ts`：EMA特定逻辑（CP/DCP/MRP/INP程序）
- `portal.controller.ts`：门户控制器
- `ctd.controller.ts`：CTD文档控制器
- 路由扩展：FDA/EMA/CTD专用路由

#### 前端新增
- 门户首页（三体系入口卡片：NMPA/FDA/EMA）
- NMPA仪表盘
- FDA仪表盘
- EMA仪表盘
- 向导式申请表单（NMPA 5步）
- 共享组件：StepWizard, CTDDocumentTree, RegulatoryTimeline
- NMPA应用向导5个步骤组件

### 审评流程

从7阶段扩展为12阶段（包含5个申报前准备步骤），后修正为7核心CDE阶段+3线平行审评。

---

## v1.2 NMPA官方UI复刻

**日期**：2026-07-15
**依据**：PDF中NMPA政务服务门户官方网站截图

### 变更内容

#### 全局主题
- 主色调改为政府蓝 `#1A5C9E`（原 `#1677ff`）
- 深色顶栏 `#1A3A6B`
- 圆角从6px减小为2px（政务网站直角风格）
- 字体改为微软雅黑
- 表格表头：蓝底白字

#### 表单布局重构
- 所有表单从标签置顶改为**标签左置**（160px宽），匹配中国政府表单标准
- 红色星号标记必填字段（`#E54545`）
- **每个字段下方添加红色12px提示文字**，内容参照PDF中NMPA申请表实际注意事项：
  - 注册分类选择指南（化药1-5类定义）
  - 药品命名规范（INN/药典名称要求）
  - 规格表述标准（与质量标准一致）
  - 适应症审评范围说明
  - 联系人信息填写警告（用于接收电子缴款通知书）
  - 境外生产额外要求（GMP证明+公证认证）
  - 专利声明法律后果
  - 共30+条专业提示

#### 向导页面
- 深蓝`#1A3A6B`顶栏"国家药品监督管理局网上办事大厅"
- 面包屑导航
- 页面标题"药品注册申请 — 国家药品监督管理局药品审评中心"
- CDE联系信息页脚

#### 门户首页
- 政府深蓝顶栏+双语文字
- 通知横幅（教学系统声明）
- 三体系入口卡（政府风格最小阴影）
- 深蓝页脚（关于/功能/免责）

---

## v1.3 FDA/EMA官方UI复刻

**日期**：2026-07-15~17
**依据**：PDF中FDA官网（fda.gov）和EMA官网（ema.europa.eu）截图

### FDA官方风格

#### 配色
- 主色：海军蓝 `#112E51`
- 辅助：FDA蓝 `#0071BC`
- 警示红：`#E31C3D`
- `.gov` 徽章风格

#### FDA 5步向导
| 步骤 | 内容 | 关键字段 |
|------|------|---------|
| Step 1 | 公司信息 | DUNS(9位), FEI(10位), ESG账号, US Agent |
| Step 2 | 申请类型 | Form 356h/1571, 505(b)(1)/(2)/(j), USAN/INN, Rx/OTC |
| Step 3 | 产品/CMC | DS/DP制造商, 工艺总结, 质量标准, 容器/密封, 稳定性 |
| Step 4 | eCTD文档 | FDA Module 1-5（21 CFR引用）|
| Step 5 | 审核提交 | DUNS/FEI格式验证, PDUFA日期 |

每个字段下方均有FDA法规引用红色提示文字。

### EMA官方风格

#### 配色
- 主色：欧盟蓝 `#003399`
- 金色点缀：`#FFD617`（EU星星）
- 警示红：`#DA2131`

#### EMA 5步向导
| 步骤 | 内容 | 关键字段 |
|------|------|---------|
| Step 1 | 程序选择 | CP/DCP/MRP/INP, RMS/CMS, 孤儿药, PIP, SA |
| Step 2 | 申请人信息 | MAH须在EU/EEA, QPPV(Article 57), 制造场所+GMP |
| Step 3 | 产品详情 | INN, Ph.Eur.剂型, 适应症(SmPC 4.1), 包装规格 |
| Step 4 | eCTD文档 | EU Module 1（Cover Letter, SmPC, GMP, QP, GCP, ERA, RMP, PIP）|
| Step 5 | 审核提交 | 费用估算(€51,800-€310,600), 孤儿药75%减免 |

### FDA/EMA特有功能

- **FDA**：RTF/RTR（Refuse-to-File/Refuse-to-Receive）决策、CRL vs Approval Letter、Paragraph I-IV专利认证、PDUFA Goal Date计算
- **EMA**：Day 120 Clock-Stop机制、LoQ（List of Questions）、Rapporteur/Co-Rapporteur任命、SME费用减免

---

## v1.4 模拟资料包

**日期**：2026-07-17
**依据**：用户需要可直接用于模拟操作的药品数据和文档

### 创建文件

```
sample-data/
├── README.md                          # 资料包说明
├── 01-NMPA申请信息填写参考.md           # 甲磺酸阿帕替尼片（化药1类）
├── 02-FDA申请信息填写参考.md            # Ensovafexib（PI3Kδ抑制剂）
├── 03-EMA申请信息填写参考.md            # Brivaracetam（SV2A配体）
├── 04-快速模拟操作指南.md               # 复制粘贴清单
├── CTD-Module1/                       # 申请表+证明性文件
├── CTD-Module2/                       # 质量综述QOS
├── CTD-Module3/                       # 原料药CMC+制剂处方工艺
├── CTD-Module4/                       # 药理学研究报告
└── CTD-Module5/                       # 临床研究报告（Phase I-III）
```

共12个文件，包含完整的虚构药品注册数据。

---

## v1.5 生产部署

**日期**：2026-07-17
**依据**：用户需要可分享的网站链接

### 配置变更

- Express服务器添加静态文件服务（生产模式下serve React build）
- API baseURL改为相对路径（生产环境`/api`，开发环境`localhost:3001/api`）
- 文件下载URL改为相对路径
- 新增`render.yaml`（Render.com一键部署）
- 新增`start.sh`（数据库迁移+播种+启动）
- 新增`.gitignore`
- 新增`README.md`（部署指南）

### 部署方式

1. **本地生产模式**：`npm run build && npm run start` → `localhost:3001`
2. **Cloudflare Tunnel**：`cloudflared tunnel --url http://localhost:3001` → 全球HTTPS
3. **Render.com**：Git push → 自动部署 → `.onrender.com`永久域名

---

## v1.6 专家评审（第一次：架构与法规准确性）

**日期**：2026-07-17
**评审人**：资深药品注册专家（20年NMPA/FDA/EMA经验）
**依据**：《药品注册管理办法》2020版、21 CFR 314/312、Directive 2001/83/EC、ICH M4/M4Q/M4S/M4E、PDUFA VII等

### 评审结论

| 维度 | 评分 | 权重 |
|------|------|------|
| 数据库 Schema | 15/25 | 15% |
| NMPA 审评流程 | 12/25 | 20% |
| FDA 审评流程 | 10/25 | 15% |
| EMA 审评流程 | 10/25 | 15% |
| 表单字段 | 18/25 | 20% |
| CTD 文档结构 | 20/25 | 15% |
| **总分** | **14.25/25** | **B+** |

### 关键批评

1. **12阶段流程包含5个申报前伪阶段**（账号注册、资料准备等不属于CDE审评阶段）
2. **技术审评时限不准确**（60天→应200工作日NDA/60工作日IND）
3. **线性审评模型不符合实际CDE平行三线架构**
4. **FDA缺少RTF/RTR决策和CRL/Approval双结果**
5. **EMA缺少标志性的Clock-Stop机制**
6. **无DMF/Dossier引用模型、无产品生命周期管理、无审计追踪**

### 评审意见

输出为 `EXPERT-REVIEW-REQUIREMENTS.md`（28项需求，P0/P1/P2/P3优先级分级）。

---

## v1.7 专家评审完善（第一次评审整改）

**日期**：2026-07-17
**依据**：v1.6专家评审报告28项需求中的P0/P1项

### P0 修复（7项）

| # | 修复项 | 实施 |
|---|--------|------|
| 1 | 去除5个申报前伪阶段 | STAGE_FLOW从12阶段精简为7核心CDE阶段 |
| 2 | 审评时限修正 | NDA 200工作日、IND 60工作日、优先130工作日 |
| 3 | 平行三线审评 | 技术审评拆为pharmaceutical/nonclinical/clinical三条独立审评线 |
| 4 | 多轮发补循环 | 新增DeficiencyLetter模型，最多4轮，Clock-Stop/Resume |
| 5 | FDA RTF/RTR | filingReview方法，Refuse-to-File或File双结果 |
| 6 | FDA CRL/Approval | issueOfficialAction方法，Complete Response Letter + Approval Letter |
| 7 | EMA Clock-Stop | issueListOfQuestions/submitResponse，时钟暂停/恢复追踪 |

### P1 修复（5项）

- 新增5个数据库模型：DeficiencyLetter, DMFReference, AuditLog, PostApprovalChange, Labeling
- FDA Paragraph I-IV专利认证字段
- NMPA表单新增RLD参比制剂字段（ANDA用）
- NMPA表单新增API/DMF引用字段
- FDA PDUFA Goal Date计算

### 前端变更

- 应用详情页：三线平行审评UI + 发补通知面板 + Clock-Stop状态
- 时间线组件：平行阶段特殊渲染
- 向导：RLD字段、DMF字段、完整表单数据提交（修复之前丢弃大部分数据的Bug）

---

## v1.8 操作流程审查（第二次专家评审）

**日期**：2026-07-17
**评审人**：同上
**依据**：完整端到端用户操作流程（NMPA/FDA/EMA全部5步向导+审评流程）

### 评审结论

| 维度 | 评分 |
|------|------|
| 操作流程合理性 | 6.5/10 |
| 内容完整性 | 5.0/10 |
| 审评员工作流 | 5.5/10 |
| 跨系统准确性 | 7.5/10 |
| 错误预防 | 4.5/10 |
| **总体** | **5.8/10** |

### 5个关键Bug

| Bug | 严重度 | 修复 |
|-----|--------|------|
| EmaStepProduct.tsx `useState`缺失导致崩溃 | 🔴 | ✅ |
| 仪表盘"新建"按钮不传递申请类型 | 🟡 | ✅ |
| ApplicationDetailPage并行阶段显示为串行 | 🟡 | ✅ |
| CTD树中文标签出现在FDA/EMA界面 | 🟡 | ✅ |
| 向导提交丢弃大部分表单数据 | 🔴 | ✅ |

### 15项内容缺失（以优先级分级）

输出为 `OPERATIONAL-AUDIT-REPORT.md`。

---

## v1.9 CTD文档模板系统

**日期**：2026-07-20
**依据**：
- NMPA：《药品注册管理办法》2020版附件4（申请表格式）
- FDA：21 CFR 201.57（PI格式）、21 CFR 314.50（NDA内容要求）、FDA Guidance on ISE/ISS
- EMA：Directive 2001/83/EC Annex I、Regulation (EC) No 726/2004、GVP Module V（EU-RMP）
- ICH：M4/M4Q/M4S/M4E（CTD结构）、E3（CSR格式）、Q1A-Q1E（稳定性）

### 新增文件

| 文件 | 行数 | 模板数 |
|------|------|--------|
| `client/src/data/ctdTemplates.ts` | 3,703 | 74 |
| `client/src/components/shared/CTDTemplateModal.tsx` | ~60 | — |

### NMPA模板（29个）

覆盖CTD五大模块：
- **Module 1**（8个）：申请表(7区完整格式)、证明性文件清单、专利声明I-IV类、说明书SmPC(23项标准格式)、包装标签、质量标准、检验报告CoA
- **Module 2**（7个）：CTD目录、QOS(3.2.S+3.2.P)、非临床综述、临床综述、非临床/临床总结
- **Module 3**（5个）：原料药CMC(S.1-S.7)、制剂(P.1-P.8)、辅料控制、DP质量标准、稳定性
- **Module 4**（4个）：药理学报告(MOA/PD)、PK报告(ADME)、毒理学(4项标准)、其他
- **Module 5**（5个）：BE报告(90%CI统计表)、临床PK(QT/DDI)、ICH E3 CSR(16章)、其他

### FDA专属模板（22个）

- **Module 1**：Form FDA 356h、Cover Letter、Administrative Documents、Prescribing Information(17 sections/21 CFR 201.57)、Container Labels(21 CFR 201.10)、Environmental Assessment(21 CFR 25.40)、Form 3397 User Fee Cover Sheet、Debarment/Financial Disclosure(21 CFR Part 54)
- **Module 2**：QOS(FDA M4Q)、Clinical Overview(FDA Benefit-Risk框架)、Clinical Summary(ISE/ISS)
- **Module 3**：DS Mfg(ICH Q11/FDA)、DP Mfg(FDA Process Validation guidance)、DP Specs、DP Stability(FDA ANDA Stability guidance)
- **Module 5**：CSR Synopsis(ICH E3)、ISE(21 CFR 314.50)、ISS(完整安全性分析)、Pediatric Data(PREA/BPCA)

### EMA专属模板（23个）

- **Module 1**：EU Application Form、Cover Letter、M1 ToC、Administrative Information(GMP/QP/GCP/PSMF)、Expert Reports(Quality/Nonclinical/Clinical)、ERA(EMA/CHMP/SWP/4447/00)、EU-RMP(GVP Module V)、PIP Compliance(Regulation 1901/2006)
- **Module 2**：QOS(Ph. Eur. alignment)、Clinical Overview(EU CTR+GCP/PV)、Clinical Summary(EMA BA/BE/PK criteria)
- **Module 3**：ASMF Declaration、DS Mfg(EU GMP Part II/ICH Q11)、DS Control(Ph. Eur. monograph alignment)、DS Stability(EU Zone II)、DP Mfg(Annex 1/Annex 16/FMD)、DP Control(Ph. Eur. 2619)、DP Stability(EU Climate Zone II)
- **Module 5**：Clinical Overview(paediatric/GCP/PV)、Benefit-Risk(EMA Day 80 AR template)、CSR(ICH E3+EU CTR+E2B SAE)、Paediatric Data(EU Paediatric Regulation)

### 交互设计

- CTDDocumentTree：每个文档节点旁增加"查看模板"链接（📋图标）
- CTDTemplateModal：960px宽模态框展示标准格式
- 顶部红字提示："以下为监管机构规定的标准格式模板，实际申报时请以最新版法规要求为准"
- 底部法规依据引用框
- 智能模板回退：先查找体系专属模板（如`1.1-fda`），不存在则回退到通用ICH M4模板

---

## 技术债务 & 未来规划

### 已知限制

| 项目 | 说明 | 优先级 |
|------|------|--------|
| SQLite单机部署 | 不适合高并发生产环境，建议迁移至PostgreSQL | P1 |
| 无自动化测试 | 缺少单元测试和集成测试 | P1 |
| 审评员角色无轨道隔离 | CMC/非临床/临床审评员权限未区分 | P1 |
| 无eCTD backbone生成 | 缺少真实电子申报XML索引 | P2 |
| 审计追踪未集成UI | AuditLog模型已建但前端未接入 | P2 |
| 产品生命周期管理未实现 | 上市后变更/年度报告功能待开发 | P2 |

### 法规更新跟踪

- NMPA：《药品注册管理办法》2020版已纳入，需关注后续修订
- FDA：PDUFA VII (2023-2027) 已引用，DUNS→UEI迁移待实施
- EMA：EU CTR (Regulation EU 536/2014) 已引用，临床试验信息系统(CTIS)待集成
- ICH：M4 guideline持续使用，eCTD v4.0规范待完整实施

---

*本文档记录了药品注册模拟系统从v1.0到v1.9的完整开发历程，每个版本的修改均基于明确的法规依据或专家评审意见。*
