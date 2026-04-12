# lich-skills

> 面向 **Claude Code**、**Gemini CLI**、**OpenAI Codex** 的个人技能集 —— 作者 [@LichAmnesia](https://github.com/LichAmnesia)。

电报风格，观点明确，零废话。工程判断力技能 + 高杠杆工具。

English: [README.md](README.md)

---

## spec-driven-dev 工作流

```
   定义          规划          构建          验证           评审           发布
 ┌────────┐   ┌────────┐   ┌─────────┐   ┌────────┐   ┌────────┐   ┌────────┐
 │  Spec  │──▶│  Plan  │──▶│  Build  │──▶│  Test  │──▶│ Review │──▶│  Ship  │
 │  规格  │   │  任务  │   │  实现   │   │ 跑通   │   │  质量  │   │  上线  │
 └────────┘   └────────┘   └─────────┘   └────────┘   └────────┘   └────────┘
     ▲                                                                 │
     └─────────────────── 反馈 / 回归 ─────────────────────────────────┘
```

一个技能、六个阶段、每步都有明确的退出条件。详见 [`skills/spec-driven-dev/`](skills/spec-driven-dev/)。

---

## debug-hypothesis 循环

```
                          ┌─────────────────────────────┐
                          │    所有假设都被否定？         │
                          │    回到 OBSERVE 重新收集      │
                          └──────────┬──────────────────┘
                                     │
  OBSERVE  ──▶  HYPOTHESIZE  ──▶  EXPERIMENT  ──▶  CONCLUDE
     │              │                  │               │
     ▼              ▼                  ▼               ▼
  复现 bug，     列 3-5 个          每次实验         根因确认
  收集症状       可能原因 +         最多改 5 行，    → 写 fix +
                 支持/反对          证伪，不是       回归测试
                 证据              证实
     │              │                  │               │
     │              │           ┌──────┘               │
     │              │           │ 被否定？              │
     │              │           ▼                      │
     │              │     换下一个假设                  │
     │              │                                  │
     └──────────────┴──── 全部写到 DEBUG.md ────────────┘
```

科学方法 debug。防止 AI 最常见的失败模式：在错误方向上蛮干。详见 [`skills/debug-hypothesis/`](skills/debug-hypothesis/)。

---

## 技能列表

| 技能 | 作用 |
|---|---|
| [`spec-driven-dev`](skills/spec-driven-dev/) | 完整软件开发生命周期：Spec → Plan → Build → Test → Review → Ship。反合理化表、验证关卡、原子提交。 |
| [`debug-hypothesis`](skills/debug-hypothesis/) | 科学方法 debug：Observe → Hypothesize → Experiment → Conclude。反"蛮干"规则、最多 5 行实验、强制 `DEBUG.md` 证据链。 |
| [`tavily-search`](skills/tavily-search/) | 通过 [Tavily](https://tavily.com) API 做网页搜索 + 正文抽取。用于事实核查、文档查询、带引用的研究。 |
| [`nano-banana`](skills/nano-banana/) | 文生图 + 图片编辑，基于 Google Nano Banana 2 (`gemini-3.1-flash-image-preview`)，支持 `512 / 1K / 2K / 4K`。 |

所有技能都从环境变量读取凭据（`TAVILY_API_KEY`、`GEMINI_API_KEY` 等）—— **绝不硬编码**。

---

## 快速安装

<details open>
<summary><b>Claude Code — 插件市场（一行搞定）</b></summary>

在 Claude Code 会话里直接输入：

```
/plugin marketplace add LichAmnesia/lich-skills
/plugin install lich-skills@lich-skills
```

三个技能立即可用。验证：

```
/skills
```

</details>

<details>
<summary><b>Claude Code — git clone 方式</b></summary>

```bash
# 1. 安装 Claude Code（如果还没装）
curl -fsSL https://claude.ai/install.sh | bash
# 或: brew install --cask claude-code

# 2. 克隆到全局 skills 目录
git clone https://github.com/LichAmnesia/lich-skills.git ~/.claude/skills/lich-skills

# 3. 启动 Claude Code
claude
> /skills
```

完整指南：[`docs/claude-code-setup.md`](docs/claude-code-setup.md)

</details>

<details>
<summary><b>Gemini CLI — extensions install（一行搞定）</b></summary>

```bash
gemini extensions install https://github.com/LichAmnesia/lich-skills
```

本仓库根目录放了 [`gemini-extension.json`](gemini-extension.json) 清单，Gemini CLI 会把整个仓库当作一个 extension 安装，并自动发现 `skills/*/SKILL.md` 里所有技能。验证：

```bash
gemini extensions list
```

手动克隆的兜底方式：

```bash
npm install -g @google/gemini-cli
git clone https://github.com/LichAmnesia/lich-skills.git ~/.gemini/extensions/lich-skills
```

完整指南：[`docs/gemini-cli-setup.md`](docs/gemini-cli-setup.md)

</details>

<details>
<summary><b>OpenAI Codex CLI</b></summary>

```bash
# 1. 安装 Codex CLI
npm install -g @openai/codex
# 或: brew install --cask codex

# 2. 安装技能集
mkdir -p ~/.codex/skills
git clone https://github.com/LichAmnesia/lich-skills.git ~/.codex/skills/lich-skills
```

完整指南：[`docs/codex-setup.md`](docs/codex-setup.md)

</details>

---

## 一行命令为什么能跑？

- **`/plugin marketplace add LichAmnesia/lich-skills`** —— Claude Code 会读取仓库根目录的 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)。这个文件把仓库声明为一个 plugin marketplace，并通过 `source: github` 字段把插件指回自己的 GitHub repo。没有这个字段，一行命令跑不通。
- **`/plugin install lich-skills@lich-skills`** —— 格式是 `<插件名>@<市场名>`。我这里两边同名，所以出现两次 `lich-skills`。addyosmani 的仓库用的是 `agent-skills@addy-agent-skills`，市场名不同，看起来更清楚。
- **`gemini extensions install <github-url>`** —— Gemini CLI 的原生 `extensions` 子命令。它要求被安装的仓库根目录必须有 `gemini-extension.json` 清单文件，才会把这个仓库当成 extension 装进来。装进来之后，`skills/*/SKILL.md` 会被自动发现。没有清单，一行命令直接拒绝安装。
- **[geminicli.com/extensions/](https://geminicli.com/extensions/) 目录** —— 这个官方扩展画廊会从公开 GitHub 仓库里收录带有 `gemini-extension.json` 清单的 extension。放清单是必要条件（但不是充分条件）——有了清单才有机会被收录。
- **`git clone` 到 `~/.claude/skills/`** —— 最朴素的路径。Claude Code 每次启动会扫描 `~/.claude/skills/**` 下所有 `SKILL.md`，不依赖 marketplace 机制。

---

## 目录结构

```
lich-skills/
├── README.md / README-zh.md      # 中英文说明
├── LICENSE                       # MIT
├── CLAUDE.md                     # 仓库内 Claude 指令
├── CONTRIBUTING.md               # 贡献规范
├── .claude-plugin/               # Claude Code 插件清单
│   ├── plugin.json
│   └── marketplace.json
├── .gitleaks.toml                # 秘钥扫描配置
├── .github/workflows/ci.yml      # CI: gitleaks + 技能格式 lint + py 编译
├── scripts/
│   ├── pre-commit                # commit 时的 gitleaks 钩子
│   └── install-hooks.sh
├── docs/                         # 三个工具的安装指南
│   ├── claude-code-setup.md
│   ├── gemini-cli-setup.md
│   └── codex-setup.md
└── skills/
    ├── spec-driven-dev/          # 六阶段 SDLC 工作流
    │   ├── SKILL.md
    │   └── templates/
    │       ├── spec.md
    │       ├── plan.md
    │       ├── review.md
    │       └── ship.md
    ├── tavily-search/            # Tavily 网页搜索
    │   ├── SKILL.md
    │   └── scripts/search.py
    └── nano-banana/              # Nano Banana 2 文生图
        ├── SKILL.md
        └── scripts/generate_image.py
```

---

## 文档

| 工具 | 安装 + 技能配置 |
|---|---|
| Claude Code | [`docs/claude-code-setup.md`](docs/claude-code-setup.md) |
| Gemini CLI | [`docs/gemini-cli-setup.md`](docs/gemini-cli-setup.md) |
| OpenAI Codex | [`docs/codex-setup.md`](docs/codex-setup.md) |

---

## 安全

仓库里没有任何秘钥。每次提交都会通过 [`gitleaks`](https://github.com/gitleaks/gitleaks) 做 pre-commit 扫描，CI 里每个 PR 还会再跑一次。所有技能只读环境变量，示例里用 `YOUR_API_KEY_HERE` 占位。

如果发现任何泄露，请通过 [私密安全通告](https://github.com/LichAmnesia/lich-skills/security/advisories/new) 反馈，不要开 public issue。

---

## 贡献

欢迎 PR。新技能要 **具体**、**可验证**、**最小化**。详见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

---

## 许可

[MIT](LICENSE) © 2026 黄声 ([@LichAmnesia](https://github.com/LichAmnesia))
