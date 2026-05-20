# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- **gacha-machine-app**: Flutter Kaigi 2025のASSIGNブース用ガチャアプリケーション (初期化済み)
- **prize-display-clarification**: ユーザに景品設定を明確に表示する機能 ✅ **実装完了** (Phase 1-4完了、全286テストパス)
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, but generate responses in Japanese (思考は英語、回答の生成は日本語で行うように)

## Workflow

### Phase 0: Steering (Optional)
`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to spec-init.

### Phase 1: Specification Creation
1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking
`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules
1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files
Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files
- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files
<!-- Added by /kiro:steering-custom command -->
<!-- Format:
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes
- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., "*.test.js")
- **Manual**: Reference with `@filename.md` syntax

## Design Guideline

ASSIGN デザインシステムに準拠したトークン定義。CSS カスタムプロパティとして `src/app.css` に一元管理。SP ファースト設計を採用し、Tablet/Desktop は `min-width` メディアクエリでスケールアップする。

---

### レスポンシブ方針 (SP ファースト)

ベースは SP (375-414px) を想定して書き、Tablet / Desktop へ `min-width` で段階的にスケールアップする。

| ブレークポイント | 範囲 | 用途 |
|---|---|---|
| SP (base) | 0 - 599px | ベース。メディアクエリなし。 |
| Tablet | 600 - 1023px | `@media (min-width: 600px)` |
| Desktop | 1024px+ | `@media (min-width: 1024px)` |

旧式の `@media (max-width: ...)` でのスケールダウン記述は使わない。

タッチターゲット最小サイズ: **44px** (主要 CTA は 48-56px)。input/textarea も `min-height: 44px`、`font-size: var(--font-size-base)` (16px) で iOS の自動ズームを防止。

モーダル: SP では bottom-sheet (画面下から立ち上げ・上部のみ角丸) とし、Tablet+ で centered 表示に切り替える。

---

### Color トークン

#### Primitive / Chromatic

| トークン名 | 色コード | 用途 |
|-----------|---------|------|
| `--color-red` | `#D70C18` | ASSIGN ブランドレッド |
| `--color-orange` | `#FF8336` | アクセント・強調 |
| `--color-yellow` | `#FFB205` | 警告・在庫少 |
| `--color-gold` | `#DAB553` | プレミアムタグ |
| `--color-green` | `#00B200` | 成功状態 |
| `--color-warm-gray` | `#F4F2F0` | 暖色系背景 |

#### Primitive / Gray (11段階)

| トークン名 | 色コード |
|-----------|---------|
| `--color-gray-0` | `#FFFFFF` |
| `--color-gray-4` | `#F5F5F5` |
| `--color-gray-10` | `#E1E1E5` |
| `--color-gray-20` | `#C6C6CC` |
| `--color-gray-30` | `#ACACB2` |
| `--color-gray-40` | `#939399` |
| `--color-gray-50` | `#797980` |
| `--color-gray-60` | `#626266` |
| `--color-gray-70` | `#4A4A4D` |
| `--color-gray-80` | `#323234` |
| `--color-gray-90` | `#1A1A1A` |

#### Semantic / Text & Icon

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-text-main` | `#1A1A1A` | 本文・見出しなど標準テキスト |
| `--color-text-sub` | `#939399` | 補助テキスト・プレースホルダー |
| `--color-text-white` | `#FFFFFF` | 塗りつぶしボタンの白抜きテキスト |

#### Semantic / Border

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-border-base` | `#E1E1E5` | 基本の枠線 (カード、フォーム) |
| `--color-border-middle` | `#ACACB2` | セパレーター線等 |
| `--color-border-white` | `#FFFFFF` | 白枠 |

#### Semantic / Surface (Background)

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-surface-base` | `#F5F5F5` | コンテンツエリア最下層・フォーム背景 |
| `--color-surface-middle` | `#E1E1E5` | やや沈ませる背景 |
| `--color-surface-high` | `#C6C6CC` | 強めグレー背景 |
| `--color-surface-warm` | `#F4F2F0` | 暖色系カード背景 |
| `--color-surface-dark-tag` | `#4A4A4D` | 黒系タグ |
| `--color-surface-white` | `#FFFFFF` | カード・モーダル本体 |

#### Semantic / Brand

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-brand-red` | `#D70C18` | ASSIGN ブランドカラー (主要 CTA) |
| `--color-brand-white` | `#FFFFFF` | ブランドロゴ白抜き |

#### Semantic / Accent

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-accent-orange` | `#FF8336` | 強調アクセント |
| `--color-accent-gold` | `#DAB553` | プレミアム強調 |

#### Semantic / State

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--color-state-error` | `#D70C18` | エラー表示・バリデーション |
| `--color-state-warning` | `#FFB205` | 警告・在庫少 |
| `--color-state-success` | `#00B200` | 成功状態 |
| `--color-state-disabled` | `#C6C6CC` | 非活性ボタン |
| `--color-state-highlight` | `#F5F5F5` | ホバーハイライト |
| `--color-overlay` | `rgba(0,0,0,0.5)` | モーダルオーバーレイ |

---

### Spacing トークン (14段階)

Auto Layout の gap/padding に使用。SP の余白は `--space-12` 〜 `--space-16` を基本に、Tablet+ で `--space-20` 〜 `--space-32` に拡張するのが目安。

| トークン名 | 値 | 用途の目安 |
|-----------|---|----------|
| `--space-0` | 0 | 隙間なし明示 |
| `--space-1` | 1px | 微細調整 (行間等) |
| `--space-2` | 2px | 微細調整 |
| `--space-4` | 4px | Tag 内 padding、極小余白 |
| `--space-6` | 6px | 密な余白 |
| `--space-8` | 8px | アイコン+テキスト、ボタン内余白 |
| `--space-10` | 10px | リスト内余白 |
| `--space-12` | 12px | ボタン内 padding、SP の関連要素間 |
| `--space-16` | 16px | SP のセクション内ブロック間 (推奨) |
| `--space-20` | 20px | カード padding (中) |
| `--space-24` | 24px | セクション間の標準 |
| `--space-32` | 32px | Tablet+ の大セクション切替 |
| `--space-40` | 40px | ページ最外周 (大) |
| `--space-48` | 48px | ヒーロー上下余白等 |

---

### Radius トークン (8段階)

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--radius-xs` | 2px | プログレスバー、ゲージ |
| `--radius-sm` | 4px | 小さなチップ・タグ |
| `--radius-md` | 6px | 標準ボタン、フォーム input |
| `--radius-lg` | 8px | カード (標準) |
| `--radius-xl` | 12px | 大きめのカード・主要 CTA |
| `--radius-2xl` | 16px | モーダル本体、大セクション |
| `--radius-3xl` | 24px | 将来用 |
| `--radius-full` | 999px | ピル型ボタン、アバター、トグル |

---

### Typography トークン

| トークン名 | 値 | 用途 |
|-----------|---|------|
| `--font-size-xs` | 12px | キャプション、補助情報 |
| `--font-size-sm` | 14px | 補助テキスト、SP の本文 |
| `--font-size-base` | 16px | 本文 (基準値、iOS zoom 防止) |
| `--font-size-lg` | 18px | 強調・サブ見出し |
| `--font-size-xl` | 20px | 小見出し |
| `--font-size-2xl` | 24px | SP のヒーロー見出し |
| `--font-size-3xl` | 28px | Tablet+ のヒーロー見出し |
| `--font-size-4xl` | 32px | Desktop のヒーロー見出し |
| `--line-height-tight` | 1.25 | 見出し |
| `--line-height-base` | 1.5 | 本文 (デフォルト) |
| `--line-height-relaxed` | 1.7 | 長文・説明文 |
