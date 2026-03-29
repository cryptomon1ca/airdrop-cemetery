# 空投墓地 AIRDROP GRAVEYARD 🪦

> 收录那些空投后归零的加密项目。数据驱动，黑色幽默，警示后人。

## 项目简介

**空投墓地**是一个 Next.js 15 项目，收录了 20 个空投后归零（或严重缩水）的加密货币项目，以黑色幽默的方式记录每个项目的死亡档案。

## 技术栈

- **Next.js 15** + TypeScript
- **Tailwind CSS**（全局样式）
- **Bebas Neue** + **DM Sans** 字体（brutalist 风格）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
open http://localhost:3000
```

## 项目结构

```
airdrop-cemetery/
├── app/
│   ├── layout.tsx        # 根布局
│   ├── page.tsx          # 主页面（客户端组件）
│   └── globals.css       # 全局样式
└── src/
    └── data/
        └── projects.ts   # 20个项目数据
```

## 收录项目（20个）

| 项目 | Symbol | 分类 | 跌幅 | 状态 |
|------|--------|------|------|------|
| Opinion | OPN | DeFi | -97.5% | 💀 已死亡 |
| Starknet | STRK | L2 | -92% | 📉 垂死中 |
| Friend.tech | FRIEND | Social | -91% | 💀 已死亡 |
| Hamster Kombat | HMSTR | GameFi | -97% | 💀 已死亡 |
| ZKsync Era | ZK | L2 | -70% | 🫀 存活中 |
| Kadena | KDA | L2 | -100% | 💀 已死亡 |
| Scroll | SCR | L2 | -96.8% | 📉 垂死中 |
| Boba Network | BOBA | L2 | -99.7% | 💀 已死亡 |
| Evmos | EVMOS | L2 | -99.9% | 💀 已死亡 |
| Blast | BLAST | L2 | -98.2% | 📉 垂死中 |
| Flow | FLOW | L2 | -99.9% | 💀 已死亡 |
| Celo | CELO | L2 | -99.2% | 📉 垂死中 |
| Manta Network | MANTA | L2 | -98.4% | 📉 垂死中 |
| Moonbeam | GLMR | L2 | -100% | 💀 已死亡 |
| Radix | XRD | L2 | -99.7% | 💀 已死亡 |
| Aptos | APT | L2 | -81% | 📉 垂死中 |
| EigenLayer | EIGEN | DeFi | -85% | 📉 垂死中 |
| LayerZero | ZRO | DeFi | -93% | 📉 垂死中 |
| Wormhole | W | DeFi | -96% | 📉 垂死中 |
| AltLayer | ALT | L2 | -98.9% | 💀 已死亡 |

## 功能特性

- 🔍 **实时搜索** 按名称/Symbol/描述过滤
- 📁 **分类筛选** DeFi / L2 / Social / GameFi
- 📊 **四种排序** 跌幅 / 背刺程度 / 日期 / TVL留存
- 💀 **详情弹窗** 完整死亡档案、争议事件、官网链接
- 📺 **滚动横幅** 实时显示统计数据
- 📱 **响应式** 移动端适配

---

*数据仅供娱乐参考，不构成投资建议。All data for educational purposes only.*
