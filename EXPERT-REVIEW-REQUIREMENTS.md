# 药品注册模拟系统 — 专家评审意见与完善需求文档

> **评审人**：资深药品注册专家 | 20年从业经验 | NMPA/CDE · FDA · EMA
>
> **评审日期**：2026-07-17
>
> **当前评级**：B+（教学仿真系统）

---

## 目录

- [一、数据库 Schema 完善需求](#一数据库-schema-完善需求)
- [二、NMPA 审评流程完善需求](#二nmpa-审评流程完善需求)
- [三、FDA 审评流程完善需求](#三fda-审评流程完善需求)
- [四、EMA 审评流程完善需求](#四ema-审评流程完善需求)
- [五、表单字段完善需求](#五表单字段完善需求)
- [六、CTD 文档结构完善需求](#六ctd-文档结构完善需求)
- [七、需求优先级矩阵](#七需求优先级矩阵)

---

## 一、数据库 Schema 完善需求

### 1.1 新增模型

#### DMF/Dossier 引用模型（🔴 P0）

```prisma
model DMFReference {
  id              Int      @id @default(autoincrement())
  applicationId   Int
  application     Application @relation(fields: [applicationId], references: [id])
  dmfType         String   // API, excipient, packaging
  dmfNumber       String   // DMF号 / 原料药登记号
  dmfHolder       String   // DMF持有人
  authorizationLetter Boolean // 授权信（LOA）是否已提交
  createdAt       DateTime @default(now())
}
```

**需求说明**：原料药DMF、辅料DMF、药包材DMF是IND/NDA申报的核心组成部分。真实申报中，制剂申请人通过DMF授权信（Letter of Authorization, LOA）引用DMF持有人的技术资料。

#### 产品生命周期模型（🔴 P0）

```prisma
model PostApprovalChange {
  id              Int      @id @default(autoincrement())
  applicationId   Int
  application     Application @relation(fields: [applicationId], references: [id])
  changeType      String   // variation, annual_report, renewal, labeling_update
  changeCategory  String   // major, moderate, minor (审批类/备案类/报告类)
  changeDescription String
  submissionDate  DateTime?
  approvalDate    DateTime?
  status          String   @default("draft")
  createdAt       DateTime @default(now())
}
```

**需求说明**：真实药品注册中，上市后变更与初始申报同等重要。NMPA将上市后变更分为审批类、备案类、报告类。FDA使用 PAS/CBE-30/CBE-0/Annual Report。EMA使用 Type IA/IB/II variations。

#### 审计追踪模型（🟢 P2）

```prisma
model AuditLog {
  id          Int      @id @default(autoincrement())
  entityType  String   // Application, Review, Document, etc.
  entityId    Int
  action      String   // CREATE, UPDATE, DELETE, SUBMIT, APPROVE, REJECT
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  changes     String   // JSON: {field: {old: ..., new: ...}}
  ipAddress   String?
  createdAt   DateTime @default(now())
}
```

**需求说明**：GxP合规要求所有数据修改可追溯。需记录每次增删改的操作人、时间、变更内容。

#### 说明书/标签模型（🟡 P1）

```prisma
model Labeling {
  id              Int      @id @default(autoincrement())
  applicationId   Int
  application     Application @relation(fields: [applicationId], references: [id])
  labelType       String   // SmPC, PIL, carton, vial_label, blister
  language        String   // zh-CN, en-US, etc.
  version         Int      @default(1)
  content         String   // 说明书全文
  negotiationStatus String @default("draft") // draft, under_review, agreed, final
  createdAt       DateTime @default(now())
}
```

**需求说明**：说明书/标签的审评和协商是注册中最耗时、最复杂的环节之一。NMPA要求说明书符合《药品说明书和标签管理规定》（局令第24号），FDA要求按 SPL 格式提交。

#### 监管沟通模型（🟢 P3）

```prisma
model RegulatoryMeeting {
  id              Int      @id @default(autoincrement())
  applicationId   Int?
  meetingType     String   // pre_IND, EOP2, pre_NDA, Type_A, Type_B, Type_C, scientific_advice
  requestDate     DateTime
  meetingDate     DateTime?
  agency          String   // NMPA, FDA, EMA
  topic           String
  minutes         String?  // 会议纪要
  outcome         String?
  createdAt       DateTime @default(now())
}
```

**需求说明**：FDA的Type A/B/C meeting、EMA的Scientific Advice、NMPA的沟通交流会（《药物研发与技术审评沟通交流管理办法》）是注册策略的核心工具。

### 1.2 现有模型修正

| 修正项 | 当前问题 | 修正方案 |
|--------|----------|----------|
| `regulatorySystemId` 默认值 | 默认NMPA(id=1) | 移除默认值，强制用户显式选择注册体系 |
| `feePayer` 字段类型 | `String?` | 改为独立的 FeeInfo 关联模型，包含费用类型、金额、支付状态、发票号 |
| `type` vs `applicationCategory` | 两个字段概念重叠 | 合并为统一的 applicationType 枚举，区分 submission_type 和 regulatory_pathway |
| `emergencyUse` 命名 | 语义模糊 | 改为 `controlledSubstance`（特殊管理药品），与实际NMPA申报表一致 |

---

## 二、NMPA 审评流程完善需求

### 2.1 核心架构修正（🔴 P0）：线性改平行

**当前设计**：
```
受理 → 形式审查 → 技术审评 → 现场核查 → 样品检验 → 行政审批 → 制证送达
```

**正确设计**：
```
                           ┌── 药学审评（CMC Team）─────┐
                           │                              │
受理 → 形式审查 → 技术审评 ─│── 非临床审评（Pharm-Tox）──│→ 综合审评会议 → 行政审批 → 制证
                           │                              │
                           └── 临床审评（Clinical Team）──┘
                                   │
                          现场核查（CFDI，独立并行）
                          样品检验（NIFDC，独立并行）
```

**实施要点**：
1. 技术审评阶段拆分为3条平行审评线，各线独立推进、独立发补
2. 三线全部完成后，进入综合审评（由主审评员汇总三线意见）
3. 现场核查和样品检验与技术审评并行开展，不是在技术审评之后

### 2.2 新增多轮发补循环（🔴 P0）

**需求说明**：真实CDE审评中，技术审评阶段通常有2-4轮发补。每次发补：
1. CDE发出《补充资料通知书》（Deficiency Letter），列出需补充的问题清单
2. 审评时钟暂停（Clock-Stop）
3. 申请人在规定时限内（通常4个月）提交补充资料
4. CDE收到补正资料后恢复审评时钟

**数据模型**：
```prisma
model DeficiencyLetter {
  id              Int      @id @default(autoincrement())
  applicationId   Int
  stageId         Int
  round           Int      // 第1轮、第2轮...
  issueDate       DateTime
  dueDate         DateTime // 补正截止日期
  responseDate    DateTime? // 实际提交日期
  status          String   // issued, responded, accepted, rejected
  questions       String   // JSON: [{category, question, guidance}]
  createdAt       DateTime @default(now())
}
```

### 2.3 审评时限修正（🔴 P0）

| 阶段 | 当前值 | 正确值 | 法规依据 |
|------|--------|--------|----------|
| 受理 | 5天 | **5个工作日** | 《药品注册管理办法》第39条 |
| 技术审评（NDA标准） | 60天 | **200个工作日** | 《药品注册管理办法》第96条 |
| 技术审评（NDA优先） | 未区分 | **130个工作日** | 《药品上市许可优先审评审批工作程序》 |
| 技术审评（IND） | 无 | **60个工作日** | 《药品注册管理办法》第87条 |
| 技术审评（ANDA） | 无 | **200个工作日** | 《药品注册管理办法》第97条 |
| 行政审批 | 20天 | **20个工作日** | 《药品注册管理办法》第100条 |
| 制证送达 | 10天 | **10个工作日** | 《药品注册管理办法》第101条 |

### 2.4 去除伪阶段（🟡 P1）

以下"阶段"应移到申报前准备工作区域，不作为审评阶段：

- ~~账号注册~~ → 移至用户系统设置
- ~~申请表填写~~ → 移至申请创建向导
- ~~CTD资料准备~~ → 移至文档管理模块
- ~~网上预约~~ → 移至提交管理
- ~~光盘递交~~ → 移至提交管理

**审评阶段应仅保留 CDE 实施监管审查的阶段**。

---

## 三、FDA 审评流程完善需求

### 3.1 新增RTF/RTR决策（🔴 P0）

**需求说明**：FDA在收到NDA/BLA后60天内作出备案审查决定（Filing Review）：

```
NDA/BLA提交 → Filing Review（60天）
  ├── ✅ File（受理）→ 进入Plan Review
  └── ❌ Refuse-to-File（RTF）→ 退回申请人，说明理由
```

**实施要点**：
1. Filing Review 不是简单的"受理"，FDA会审查资料的完整性和可审评性
2. RTF 需要发出详细的 RTF Letter，列出所有缺陷
3. 申请人修正后可重新提交

### 3.2 新增CRL/Approval双结果（🔴 P0）

**需求说明**：FDA的Official Action阶段有两个完全不同的结果：

| 结果 | 说明 |
|------|------|
| **Approval Letter** | 批准信，药品可上市销售，含批准的标签说明书 |
| **Complete Response Letter (CRL)** | 完整回复函，列出所有未解决问题，申请未获批准 |

CRL不是"拒绝"，而是"暂未批准"——申请人可补充资料后重新提交（Class 1/2 Resubmission）。

### 3.3 新增REMS模型（🟡 P1）

**需求说明**：Risk Evaluation and Mitigation Strategy（风险评估与减轻策略）是FDA要求某些高风险药物实施的风险管理计划。

### 3.4 新增505(b)(2)/ANDA专利声明（🟢 P2）

**需求说明**：仿制药申报需提供 Paragraph I-IV 专利认证：

| 类型 | 说明 |
|------|------|
| Paragraph I | 橙皮书中无相关专利 |
| Paragraph II | 相关专利已过期 |
| Paragraph III | 将在专利过期后上市 |
| Paragraph IV | 专利无效或不侵权（专利挑战）|

### 3.5 其他FDA缺失功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| PMR/PMC 追踪 | 🟡 P1 | Post-Marketing Requirements/Commitments |
| PDUFA Goal Date | 🟡 P1 | 每个申请的法定审评目标日期 |
| Advisory Committee | 🟢 P2 | 专家咨询委员会会议 |
| 351(k) Biosimilar | 🟢 P3 | 生物类似药独立申报路径 |
| DUNS→UEI 迁移 | 🟢 P3 | DUNS正被SAM.gov的UEI取代 |

---

## 四、EMA 审评流程完善需求

### 4.1 新增Clock-Stop机制（🔴 P0）

**需求说明**：Clock-Stop 是EMA中央程序**最具标志性的特征**。

```
MAA提交 → Validation（14天）→ CHMP Assessment D1-D120
  → D120: CHMP发出 List of Questions（LoQ）→ **CLOCK STOP**
  → 申请人准备回复（3-6个月，可申请延期）
  → 申请人提交回复 → **CLOCK RESTART**
  → CHMP Assessment D121-D180
  → D180: CHMP发出 List of Outstanding Issues（LoOI）（可选，再次时钟暂停）
  → 申请人回复 → 再次恢复 → D210
  → CHMP Opinion
  → EC Decision（67天）
```

**实施要点**：
1. 在 ApplicationStage 模型中增加 `clockStoppedAt` 和 `clockRestartedAt` 字段
2. 新增 LoQ/LoOI 模型，关联审评阶段
3. 时钟暂停期间不计入审评天数

### 4.2 新增Rapporteur/Co-Rapporteur任命（🟡 P1）

**需求说明**：CHMP为每个MAA任命两名评估员：
- **Rapporteur（主审评员）**：来自一个成员国的专家，主导评估
- **Co-Rapporteur（副审评员）**：来自另一个成员国的专家，独立复核

两人分别撰写 Assessment Report，在 CHMP 全体会议上讨论。

### 4.3 新增Oral Explanation（🟢 P2）

**需求说明**：CHMP可要求申请人对关键问题进行口头答辩（Oral Explanation），通常在 D180 后安排。

### 4.4 其他EMA缺失功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| PSUR/PSMF | 🟡 P1 | 定期安全性更新报告/药物警戒体系主文件 |
| Referral Procedures | 🟢 P2 | Article 29/30/31 仲裁程序 |
| PRAC Assessment | 🟢 P2 | 药物警戒风险评估委员会 |
| COMP（孤儿药） | 🟢 P3 | 孤儿药认定由专门的孤儿药品委员会负责 |

---

## 五、表单字段完善需求

### 5.1 NMPA 表单缺失字段

| 缺失字段 | 优先级 | 说明 |
|----------|--------|------|
| **参比制剂（RLD）选择** | 🟡 P1 | 仿制药/改良型新药需指定参比制剂，包括品名、规格、持证商 |
| **API/原料药登记号** | 🟡 P1 | 引用已登记的原料药备案号（Y2023XXXX）或DMF号 |
| **专利声明类型** | 🟢 P2 | 区分专利权属声明、不侵权声明、专利挑战 |
| **注册代理机构** | 🟢 P2 | 境外申请人须指定境内注册代理机构（含委托书、公证文书） |
| **证明性文件清单** | 🟢 P2 | 营业执照、生产许可证、GMP证书、公证认证文书等的系统化清单 |

### 5.2 FDA 表单缺失字段

| 缺失字段 | 优先级 | 说明 |
|----------|--------|------|
| **505(b)(2) RLD信息** | 🟡 P1 | 引用已批准药品作为RLD的详细信息 |
| **ANDA Paragraph认证** | 🟡 P1 | Paragraph I-IV 专利声明 |
| **US Agent条件验证** | 🟢 P2 | 仅境外申请人需要US Agent，境内申请人应跳过此字段 |
| **UEI替换DUNS** | 🟢 P3 | SAM.gov的Unique Entity ID正逐步取代DUNS |

### 5.3 EMA 表单缺失字段

| 缺失字段 | 优先级 | 说明 |
|----------|--------|------|
| **RMS确认函** | 🟡 P1 | DCP/MRP程序必须事先获得RMS书面确认 |
| **语言翻译计划** | 🟢 P2 | SmPC/标签需翻译为所有CMS成员国语言 |
| **CMDh跟踪** | 🟢 P3 | DCP/MRP的后续协调程序 |

---

## 六、CTD 文档结构完善需求

### 6.1 eCTD Backbone（🟢 P3）

**需求说明**：真实电子申报必须生成符合规范的 XML backbone 文件（index.xml），描述整个申报结构的元数据。ICH和FDA/EMA都有具体的eCTD规范。

### 6.2 文档版本与生命周期（🟡 P1）

**需求说明**：监管申报文件会经历多次修订。如：
- Sequence 0000（初始提交）
- Sequence 0001（首次补正回复）
- Sequence 0002（第2轮补正回复）

每次Sequence包含新增、替换或删除的文件。

### 6.3 文档完成度统计（🟢 P2）

**需求说明**：在Document模型上增加以下统计字段：
- 每个CTD子模块的文档完整度百分比
- 必需文档（isRequired=true）的缺失提醒
- 文件格式合规检查（PDF版本、字体嵌入、文件命名规范等）

### 6.4 跨模块引用索引（🟢 P3）

**需求说明**：Module 2的综述文档（QOS、非临床综述、临床综述）中包含对Module 3/4/5具体章节的引用，系统应支持建立这些交叉引用关系。

---

## 七、需求优先级矩阵

### 🔴 P0 — 必须修正（根本性架构问题）

| # | 需求 | 影响模块 | 工作量 |
|---|------|----------|--------|
| 1 | NMPA技术审评改为平行三线（药学/非临床/临床） | workflow.service.ts | 🔴 大 |
| 2 | 新增多轮发补循环（Deficiency Letter + Clock-Stop） | workflow.service.ts + schema | 🔴 大 |
| 3 | 审评时限修正为实际法规时限 | constants.ts | 🟢 小 |
| 4 | FDA新增RTF/RTR决策路径 | fda.service.ts | 🟡 中 |
| 5 | FDA新增CRL/Approval双结果 | fda.service.ts | 🟡 中 |
| 6 | EMA新增Clock-Stop机制 | ema.service.ts | 🟡 中 |
| 7 | 去除5个申报前伪阶段 | workflow.service.ts + 前端 | 🟢 小 |

### 🟡 P1 — 应该完善（重要功能缺失）

| # | 需求 | 影响模块 | 工作量 |
|---|------|----------|--------|
| 8 | NMPA新增参比制剂（RLD）选择 | 表单 + schema | 🟢 小 |
| 9 | NMPA新增API/原料药登记号引用 | 表单 + schema | 🟢 小 |
| 10 | FDA新增505(b)(2)/ANDA Paragraph认证 | 表单 + schema | 🟢 小 |
| 11 | 新增产品生命周期管理 | schema + service | 🔴 大 |
| 12 | 新增说明书/标签模型 | schema + service | 🟡 中 |
| 13 | 新增DMF/Dossier引用模型 | schema + service | 🟡 中 |
| 14 | FDA新增REMS模型 | schema + service | 🟡 中 |
| 15 | FDA新增PMR/PMC追踪 | schema | 🟢 小 |
| 16 | EMA新增Rapporteur/Co-Rapporteur任命 | ema.service.ts | 🟡 中 |
| 17 | 文档版本与生命周期追踪 | ctd.service.ts | 🟡 中 |

### 🟢 P2 — 建议完善（提升专业度）

| # | 需求 | 影响模块 |
|---|------|----------|
| 18 | 新增审计追踪（Audit Trail） | schema + middleware |
| 19 | NMPA专利声明类型细化（I-IV型） | 表单 + schema |
| 20 | FDA US Agent条件验证（仅境外需要） | 表单 |
| 21 | EMA Oral Explanation机制 | ema.service.ts |
| 22 | EMA Referral Procedures (Art. 29/30/31) | ema.service.ts |
| 23 | CTD文档完成度统计面板 | 前端 + ctd.service.ts |

### 🟢 P3 — 可选完善（锦上添花）

| # | 需求 | 影响模块 |
|---|------|----------|
| 24 | eCTD backbone（XML index）生成 | ctd.service.ts |
| 25 | 监管沟通交流（Meeting Request/Minutes） | schema + 新页面 |
| 26 | FDA 351(k) Biosimilar路径 | schema + service |
| 27 | DUNS→UEI迁移 | fda表单 |
| 28 | 跨模块引用索引 | ctd.service.ts |

---

## 附录：法规参考依据

| 法规文件 | 适用体系 |
|----------|----------|
| 《药品注册管理办法》（2020年版，总局令第27号） | NMPA |
| 《药品上市许可优先审评审批工作程序》 | NMPA |
| 《药物研发与技术审评沟通交流管理办法》 | NMPA |
| 21 CFR 314 (NDA) / 21 CFR 312 (IND) | FDA |
| PDUFA VII (2023-2027) | FDA |
| Regulation (EC) No 726/2004 | EMA |
| Directive 2001/83/EC | EMA |
| ICH M4/M4Q/M4S/M4E (CTD) | 全部 |
| ICH Q1A-Q1E (Stability) | 全部 |
| ICH M7 (Mutagenic Impurities) | 全部 |
| ICH E3/E6/E8/E9 (Clinical) | 全部 |

---

*本文档基于资深注册专家评审生成，作为后续版本迭代的需求基线。*
