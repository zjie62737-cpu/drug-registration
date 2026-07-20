# 药品注册模拟操作资料包

本目录包含用于模拟药品注册申报的完整参考资料和示例文件。

## 📁 目录结构

```
sample-data/
├── README.md                          # 本文件
├── 01-NMPA申请信息填写参考.md           # NMPA 5步向导完整填写参考
├── 02-FDA申请信息填写参考.md            # FDA 5步向导完整填写参考
├── 03-EMA申请信息填写参考.md            # EMA 5步向导完整填写参考
├── 04-快速模拟操作指南.md               # 快速上手指南（复制粘贴用）
├── CTD-Module1/                       # Module 1: 行政信息文件
│   ├── 申请表.txt
│   ├── 营业执照.pdf
│   ├── 生产许可证.pdf
│   └── GMP证书.pdf
├── CTD-Module2/                       # Module 2: CTD总结
│   ├── 质量综述QOS.txt
│   ├── 非临床综述.txt
│   └── 临床综述.txt
├── CTD-Module3/                       # Module 3: 质量/CMC
│   ├── 原料药基本信息.txt
│   ├── 原料药生产工艺.txt
│   ├── 制剂处方工艺.txt
│   └── 稳定性研究数据.txt
├── CTD-Module4/                       # Module 4: 非临床研究
│   ├── 药理学研究报告.txt
│   ├── 药代动力学报告.txt
│   └── 毒理学报告.txt
└── CTD-Module5/                       # Module 5: 临床研究
    ├── 生物等效性报告.txt
    ├── 临床药理学报告.txt
    ├── 临床疗效报告.txt
    └── 临床安全性报告.txt
```

## 🚀 快速开始

1. 打开系统 http://localhost:5173
2. 登录账号: `applicant1` / `applicant123`
3. 选择注册体系（NMPA/FDA/EMA）
4. 点击"新建注册申请"
5. 参照对应体系的填写参考文档，复制粘贴信息到表单
6. 在CTD文档步骤上传本目录中的示例文件

## 📋 测试账号

| 角色 | 用户名 | 密码 | 体系 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 全部 |
| 申请人 | applicant1 | applicant123 | 全部 |
| NMPA审评员 | reviewer1 | reviewer123 | NMPA |
| FDA审评员 | fda_reviewer | fda123 | FDA |
| EMA审评员 | ema_reviewer | ema123 | EMA |
