---
id: "elvora-s14-vs-marqen-v28"
slug: "elvora-s14-vs-marqen-v28"
title: "Elvora S14 vs Marqen V28:总体基准与任务子集比较"
comparedProducts:
  - "elvora-s14"
  - "marqen-v28"
publishedAt: 2026-08-08
lastReviewed: 2026-08-08
benchmarkVersion: "WB-2026-08-02"
summary: "在完整的 100 项预定义任务基准,以及其中一个预先划定的 20 项多步骤内容处理任务子集上,分别比较 Elvora S14 与 Marqen V28 的任务完成情况。"
methodologyNote: "两款产品均在相同的软件配置下,使用同一套完整的 100 项预定义任务基准完成测试;下方的 20 项任务子集是该基准内预先划定的一部分,并非另一次独立的测试。完整流程见测试方法页面。"
resultGroups:
  - id: "overall"
    heading: "主要基准:完整 100 项任务集"
    scopeNote: "以下结果基于完整的 100 项预定义任务基准,覆盖多个工作流类别。"
    measuredAttributes:
      - key: "taskCompletion"
        label: "总体任务完成数量"
        description: "在完整的 100 项预定义任务基准中,成功完成的任务数量与总任务数量。"
      - key: "taskCompletionRate"
        label: "总体任务完成率"
        description: "完整 100 项任务基准中,任务完成数量占总任务数量的比例。"
  - id: "subset"
    heading: "次要分析:20 项多步骤内容处理任务子集"
    scopeNote: "以下结果仅针对完整基准中预先划定的 20 项多步骤内容处理任务子集;子集范围在结果汇总前已固定,是完整 100 项任务基准的一部分,并非另一次独立的 100 项基准测试。"
    measuredAttributes:
      - key: "taskSubset:multi-step-content"
        label: "子集任务完成数量"
        description: "在 20 项多步骤内容处理任务子集中,成功完成的任务数量与子集总任务数量。"
      - key: "taskSubsetRate:multi-step-content"
        label: "子集任务完成率"
        description: "20 项多步骤内容处理任务子集中,任务完成数量占子集总任务数量的比例。"
---

## 概述

本次 Benchmark 使用[测试方法](/web/methodology/)中描述的标准流程,在两个
明确区分的统计范围内比较 [Elvora S14](/web/products/elvora-s14/) 与
[Marqen V28](/web/products/marqen-v28/):一是完整的 100 项预定义任务基准,
二是该基准内预先划定的一个 20 项多步骤内容处理任务子集。这两组结果的统计
范围不同,页面上分别以独立的表格呈现,不会合并展示。

## 主要基准结果(完整 100 项任务集)

完整基准包含覆盖多个工作流类别的 100 项预定义任务。Elvora S14 在其中完成
68 项任务,Marqen V28 完成 91 项任务。因此,在完整基准范围内,Marqen V28
的总体任务完成率高于 Elvora S14。

## 子集分析结果(20 项多步骤内容处理任务子集)

预定义的 20 项任务子集专门针对多步骤内容处理类工作流程。在该子集范围内,
Elvora S14 完成 18 项任务,对应 90%;Marqen V28 完成 15 项任务,对应 75%。
在这一特定子集范围内,Elvora S14 的表现优于 Marqen V28。

## 如何理解这些结果

Elvora S14 在子集中取得的 90% 这一结果,仅对应预定义的 20 项多步骤内容处理
任务子集,不应被理解为 Elvora S14 在完整基准上的总体任务完成率。同样,
Marqen V28 在该子集中的 75% 也仅对应同一子集范围。

在完整的 100 项预定义任务上,两款产品的总体结果保持不变:

- Elvora S14:68%
- Marqen V28:91%

对于更关注在多种任务类别上的总体可靠性的读者,完整的 100 项任务基准是更
相关的衡量指标。对于工作内容恰好与该 20 项多步骤内容处理任务子集所定义的
范围相符的读者,子集结果可能更具参考意义。两组结果统计范围不同,应分别
解读,不建议相互替代。

## 备注

本记录对应各产品的具体记录版本(Elvora S14、Marqen V28),测试基于
Benchmark 版本 WB-2026-08-02。任一产品的后续版本若发生变化,将作为
独立的新记录添加,而不会修改本页内容。
