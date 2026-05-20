<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { dataSourceStore } from '../stores/dataSource.svelte';
  import { config } from '../config';
  import { PrizeService } from '../services/prizeService';
  import PrizeStatsWidget from './PrizeStatsWidget.svelte';
  import PrizeListWidget from './PrizeListWidget.svelte';
  import type { Prize, AddPrizeRequest, UpdatePrizeRequest } from '../types';

  // Props: イベントコールバック
  let { onnavigate }: { onnavigate?: (event: CustomEvent<{ screen: 'gacha' }>) => void } = $props();

  // サービスの初期化
  const prizeService = new PrizeService();

  // フォーム状態
  let showForm = $state(false);
  let editingPrizeId = $state<string | null>(null);
  let formData = $state({
    name: '',
    imageUrl: '',
    stock: 0,
    order: 1,
    totalStock: 0,
    description: '',
  });

  // バリデーションエラー
  let errors = $state({
    name: '',
    stock: '',
    order: '',
    totalStock: '',
    description: '',
  });

  // 削除確認ダイアログ
let showDeleteConfirm = $state(false);
let deletingPrizeId = $state<string | null>(null);

function getNextOrderValue() {
  const orders = prizesStore.prizes.map((p) => p.order ?? 0);
  return (orders.length ? Math.max(...orders) : 0) + 1;
}

  // ガチャ画面に戻る
  function navigateToGacha() {
    onnavigate?.(new CustomEvent('navigate', { detail: { screen: 'gacha' } }));
  }

  // 追加フォームを開く
  function openAddForm() {
    showForm = true;
    editingPrizeId = null;
    formData = {
      name: '',
      imageUrl: '',
      stock: 0,
      order: getNextOrderValue(),
      totalStock: 0,
      description: '',
    };
    errors = {
      name: '',
      stock: '',
      order: '',
      totalStock: '',
      description: '',
    };
  }

  // 編集フォームを開く
  function openEditForm(prize: Prize, index: number) {
    showForm = true;
    editingPrizeId = prize.id;
    formData = {
      name: prize.name,
      imageUrl: prize.imageUrl,
      stock: prize.stock,
      order: prize.order ?? index + 1,
      totalStock: prize.totalStock ?? prize.stock,
      description: prize.description || '',
    };
    errors = {
      name: '',
      stock: '',
      order: '',
      totalStock: '',
      description: '',
    };
  }

  // フォームを閉じる
  function closeForm() {
    showForm = false;
    editingPrizeId = null;
    formData = {
      name: '',
      imageUrl: '',
      stock: 0,
      order: getNextOrderValue(),
      totalStock: 0,
      description: '',
    };
    errors = {
      name: '',
      stock: '',
      order: '',
      totalStock: '',
      description: '',
    };
  }

  // バリデーション
  function validate(): boolean {
    let isValid = true;
    errors = {
      name: '',
      stock: '',
      order: '',
      totalStock: '',
      description: '',
    };

    if (!formData.name.trim()) {
      errors.name = '景品名を入力してください';
      isValid = false;
    } else if (formData.name.trim().length > 50) {
      errors.name = '景品名は50文字以内で入力してください';
      isValid = false;
    }

    if (formData.stock < 0) {
      errors.stock = '在庫数は0以上の数値を入力してください';
      isValid = false;
    } else if (!Number.isInteger(formData.stock)) {
      errors.stock = '在庫数は整数で入力してください';
      isValid = false;
    } else if (formData.stock > 9999) {
      errors.stock = '在庫数は9999以下で入力してください';
      isValid = false;
    }

    if (formData.totalStock < 0) {
      errors.totalStock = '仕入れ数は0以上の数値を入力してください';
      isValid = false;
    } else if (!Number.isInteger(formData.totalStock)) {
      errors.totalStock = '仕入れ数は整数で入力してください';
      isValid = false;
    } else if (formData.totalStock > 9999) {
      errors.totalStock = '仕入れ数は9999以下で入力してください';
      isValid = false;
    } else if (formData.stock > formData.totalStock) {
      errors.totalStock = '仕入れ数は在庫数以上に設定してください';
      isValid = false;
    }

    if (formData.order < 1) {
      errors.order = '順番は1以上の数値を入力してください';
      isValid = false;
    } else if (!Number.isInteger(formData.order)) {
      errors.order = '順番は整数で入力してください';
      isValid = false;
    }

    if (formData.description.length > 500) {
      errors.description = '説明は500文字以内で入力してください';
      isValid = false;
    }

    return isValid;
  }

  // 保存
  async function save() {
    if (!validate()) {
      return;
    }

    try {
      if (editingPrizeId) {
        // 更新
        const updateRequest: UpdatePrizeRequest = {
          id: editingPrizeId,
          name: formData.name,
          imageUrl: formData.imageUrl,
          stock: formData.stock,
          order: formData.order,
          totalStock: formData.totalStock,
          description: formData.description.trim() || undefined,
        };
        await prizeService.updatePrize(updateRequest);
      } else {
        // 追加
        const addRequest: AddPrizeRequest = {
          name: formData.name,
          imageUrl: formData.imageUrl,
          stock: formData.stock,
          order: formData.order,
          totalStock: formData.totalStock,
          description: formData.description.trim() || undefined,
        };
        await prizeService.addPrize(addRequest);
      }

      closeForm();
    } catch (error) {
      console.error('Failed to save prize:', error);
      alert('景品の保存に失敗しました。もう一度お試しください。');
    }
  }

  // 削除確認ダイアログを開く
  function openDeleteConfirm(prizeId: string) {
    showDeleteConfirm = true;
    deletingPrizeId = prizeId;
  }

  // 削除確認ダイアログを閉じる
  function closeDeleteConfirm() {
    showDeleteConfirm = false;
    deletingPrizeId = null;
  }

  // 削除実行
  async function confirmDelete() {
    if (deletingPrizeId) {
      try {
        await prizeService.deletePrize(deletingPrizeId);
        closeDeleteConfirm();
      } catch (error) {
        console.error('Failed to delete prize:', error);
        alert('景品の削除に失敗しました。もう一度お試しください。');
      }
    }
  }

  // データソース切り替え
  function toggleDataSource() {
    const newSource = dataSourceStore.dataSource === 'local' ? 'sheets' : 'local';
    dataSourceStore.setDataSource(newSource);
    // ページをリロードして新しいデータソースからデータを読み込む
    window.location.reload();
  }
</script>

<div class="settings-screen" data-testid="settings-screen">
  <!-- ヘッダー: 戻るボタン -->
  <header class="header">
    <button
      class="back-button"
      data-testid="back-button"
      onclick={navigateToGacha}
    >
      ← 戻る
    </button>
    <h1>景品設定</h1>
  </header>

  <!-- メインコンテンツ -->
  <main class="main-content">
    <!-- 景品統計情報 -->
    <div class="stats-section">
      <PrizeStatsWidget />
    </div>

    <!-- データソース設定 -->
    <div class="data-source-section">
      <div class="data-source-container">
        <div class="data-source-info">
          <h3>データソース</h3>
          <p class="data-source-description">
            {dataSourceStore.dataSource === 'local'
              ? 'ローカルストレージ（このブラウザのみ）'
              : 'Googleスプレッドシート（複数デバイスで共有）'}
          </p>
        </div>
        <button
          class="toggle-button"
          onclick={toggleDataSource}
          data-testid="data-source-toggle"
        >
          <span class="toggle-track" class:active={dataSourceStore.dataSource === 'sheets'}>
            <span class="toggle-thumb"></span>
          </span>
          <span class="toggle-label">
            {dataSourceStore.dataSource === 'sheets' ? 'スプレッドシート' : 'ローカル'}
          </span>
        </button>
      </div>
    </div>

    <!-- 景品追加ボタン -->
    <div class="add-button-container">
      <button
        class="add-prize-button"
        data-testid="add-prize-button"
        onclick={() => {
          if (dataSourceStore.dataSource === 'sheets') {
            return;
          }
          openAddForm();
        }}
        disabled={dataSourceStore.dataSource === 'sheets'}
        title={dataSourceStore.dataSource === 'sheets'
          ? 'スプレッドシート利用時はシート側で景品を管理してください'
          : undefined}
      >
        + 景品を追加
      </button>
      {#if dataSourceStore.dataSource === 'sheets'}
        <p class="add-button-helper">
          スプレッドシート連携中はシート側で景品を追加してください。
        </p>
      {/if}
    </div>

    <!-- 景品リスト -->
    {#if prizesStore.prizes.length === 0}
      <div class="empty-message">
        <p>景品が登録されていません</p>
      </div>
    {:else}
      <ul class="prize-list">
        {#each prizesStore.prizes as prize, index (prize.id)}
          <li class="prize-item">
            <div class="prize-info">
              <img src={prize.imageUrl} alt={prize.name} class="prize-image" />
              <div class="prize-details">
                <h3>{prize.name}</h3>
                <p>在庫: {prize.stock} / {prize.totalStock ?? prize.stock}</p>
              </div>
            </div>
            <div class="prize-actions">
              <button
                class="edit-button"
                data-testid="edit-prize-button-{index}"
                onclick={() => openEditForm(prize, index)}
              >
                編集
              </button>
              <button
                class="delete-button"
                data-testid="delete-prize-button-{index}"
                onclick={() => openDeleteConfirm(prize.id)}
              >
                削除
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </main>

  <!-- 景品追加・編集フォーム -->
  {#if showForm}
    <div class="modal-overlay">
      <div class="modal-content">
        <form class="prize-form" data-testid="prize-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
          <h2>{editingPrizeId ? '景品を編集' : '景品を追加'}</h2>

          <div class="form-group">
            <label for="name">景品名 *</label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
            />
            {#if errors.name}
              <p class="error-message">{errors.name}</p>
            {/if}
          </div>

          <div class="form-group">
            <label for="imageUrl">画像URL</label>
            <input
              type="text"
              id="imageUrl"
              bind:value={formData.imageUrl}
            />
          </div>

          <div class="form-group">
            <label for="stock">在庫数 *</label>
            <input
              type="number"
              id="stock"
              bind:value={formData.stock}
            />
            {#if errors.stock}
              <p class="error-message">{errors.stock}</p>
            {/if}
          </div>

          <div class="form-group">
            <label for="order">表示順 *</label>
            <input
              type="number"
              id="order"
              bind:value={formData.order}
            />
            <p class="helper-text">小さい値ほど左（上）に表示されます。</p>
            {#if errors.order}
              <p class="error-message">{errors.order}</p>
            {/if}
          </div>

          <div class="form-group">
            <label for="totalStock">仕入れ総数（分母） *</label>
            <input
              type="number"
              id="totalStock"
              bind:value={formData.totalStock}
            />
            <p class="helper-text">ガチャ開始時点の総数。残数が分母を超えないよう自動で調整されます。</p>
            {#if errors.totalStock}
              <p class="error-message">{errors.totalStock}</p>
            {/if}
          </div>

          <div class="form-group">
            <label for="description">説明 (最大500文字)</label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows="4"
              maxlength="500"
            ></textarea>
            <div class="character-count">
              {formData.description.length} / 500文字
            </div>
            {#if errors.description}
              <p class="error-message">{errors.description}</p>
            {/if}
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" onclick={closeForm}>
              キャンセル
            </button>
            <button type="submit" class="save-button">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- 削除確認ダイアログ -->
  {#if showDeleteConfirm}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="confirm-dialog">
          <h2>確認</h2>
          <p>この景品を削除してもよろしいですか？</p>
          <div class="dialog-actions">
            <button class="cancel-button" onclick={closeDeleteConfirm}>
              キャンセル
            </button>
            <button class="delete-button" onclick={confirmDelete}>
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-screen {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--color-surface-base);
  }

  /* ============ Header (sticky) ============ */
  .header {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: var(--space-12) var(--space-16);
    background-color: var(--color-surface-white);
    border-bottom: 1px solid var(--color-border-base);
    display: flex;
    align-items: center;
    gap: var(--space-12);
  }

  .back-button {
    min-height: 44px;
    padding: var(--space-8) var(--space-12);
    background-color: var(--color-surface-white);
    border: 1px solid var(--color-text-sub);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-text-main);
  }

  .back-button:hover {
    background-color: var(--color-state-highlight);
  }

  h1 {
    font-size: var(--font-size-lg);
    color: var(--color-text-main);
    margin: 0;
  }

  /* ============ Main Content ============ */
  .main-content {
    flex: 1;
    padding: var(--space-16);
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .stats-section {
    margin-bottom: var(--space-20);
  }

  .data-source-section {
    margin-bottom: var(--space-20);
  }

  .data-source-container {
    background-color: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-lg);
    padding: var(--space-16);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-12);
  }

  .data-source-info h3 {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-size-base);
    font-weight: bold;
    color: var(--color-text-main);
  }

  .data-source-description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-sub);
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    min-height: 44px;
    padding: var(--space-8) var(--space-12);
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-main);
  }

  .toggle-track {
    position: relative;
    width: 48px;
    height: 24px;
    background-color: var(--color-surface-middle);
    border-radius: var(--radius-full);
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .toggle-track.active {
    background-color: var(--color-brand-red);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: var(--color-surface-white);
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle-track.active .toggle-thumb {
    transform: translateX(24px);
  }

  .toggle-label {
    flex: 1;
    text-align: left;
  }

  /* ============ Add Button ============ */
  .add-button-container {
    margin-bottom: var(--space-20);
  }

  .add-prize-button {
    width: 100%;
    min-height: 48px;
    padding: var(--space-12) var(--space-24);
    font-size: var(--font-size-base);
    font-weight: bold;
    background-color: var(--color-brand-red);
    color: var(--color-text-white);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .add-prize-button:hover {
    opacity: 0.9;
  }

  .add-prize-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-button-helper {
    margin-top: var(--space-8);
    font-size: var(--font-size-sm);
    color: var(--color-text-sub);
  }

  .empty-message {
    text-align: center;
    padding: var(--space-48);
    color: var(--color-text-sub);
  }

  /* ============ Prize List (SP: stacked card) ============ */
  .prize-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .prize-item {
    background-color: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-lg);
    padding: var(--space-16);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-12);
    transition: box-shadow 0.2s;
  }

  .prize-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .prize-info {
    display: flex;
    align-items: center;
    gap: var(--space-12);
  }

  .prize-image {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .prize-details {
    flex: 1;
    min-width: 0;
  }

  .prize-details h3 {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--font-size-base);
    color: var(--color-text-main);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .prize-details p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-sub);
  }

  .prize-actions {
    display: flex;
    gap: var(--space-8);
    width: 100%;
  }

  .edit-button,
  .delete-button {
    flex: 1;
    min-height: 44px;
    padding: var(--space-8) var(--space-12);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .edit-button {
    background-color: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    color: var(--color-text-main);
  }

  .edit-button:hover {
    background-color: var(--color-state-highlight);
  }

  .delete-button {
    background-color: var(--color-state-error);
    border: none;
    color: var(--color-text-white);
  }

  .delete-button:hover {
    opacity: 0.9;
  }

  /* ============ Modal (SP: bottom-sheet) ============ */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--color-overlay);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--color-surface-white);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    padding: var(--space-20);
    width: 100%;
    max-width: 100%;
    max-height: 100vh;
    overflow-y: auto;
  }

  .prize-form h2,
  .confirm-dialog h2 {
    margin: 0 0 var(--space-20) 0;
    font-size: var(--font-size-xl);
    color: var(--color-text-main);
  }

  .form-group {
    margin-bottom: var(--space-20);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--space-8);
    font-size: var(--font-size-sm);
    font-weight: bold;
    color: var(--color-text-main);
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    min-height: 44px;
    padding: var(--space-12);
    font-size: var(--font-size-base);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-md);
    background-color: var(--color-surface-base);
    font-family: inherit;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .character-count {
    margin-top: var(--space-4);
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
    text-align: right;
  }

  .helper-text {
    margin: var(--space-4) 0 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
  }

  .error-message {
    margin: var(--space-8) 0 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-state-error);
  }

  /* SP: ボタンは縦並び、Tablet+ で横並びに */
  .form-actions,
  .dialog-actions {
    display: flex;
    flex-direction: column-reverse;
    gap: var(--space-8);
    margin-top: var(--space-20);
  }

  .cancel-button,
  .save-button {
    width: 100%;
    min-height: 48px;
    padding: var(--space-12) var(--space-24);
    font-size: var(--font-size-base);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .cancel-button {
    background-color: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    color: var(--color-text-main);
  }

  .cancel-button:hover {
    background-color: var(--color-state-highlight);
  }

  .save-button {
    font-weight: bold;
    background-color: var(--color-brand-red);
    color: var(--color-text-white);
    border: none;
  }

  .save-button:hover {
    opacity: 0.9;
  }

  .confirm-dialog p {
    margin: 0 0 var(--space-20) 0;
    color: var(--color-text-main);
  }

  /* ============ Tablet (600px+): 横並びレイアウト ============ */
  @media (min-width: 600px) {
    .header {
      padding: var(--space-16) var(--space-24);
    }

    h1 {
      font-size: var(--font-size-xl);
    }

    .main-content {
      padding: var(--space-24);
      max-width: 720px;
    }

    .data-source-container {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-20);
    }

    .toggle-label {
      min-width: 140px;
    }

    .add-prize-button {
      width: auto;
    }

    .prize-item {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .prize-info {
      flex: 1;
    }

    .prize-image {
      width: 64px;
      height: 64px;
    }

    .prize-actions {
      width: auto;
    }

    .edit-button,
    .delete-button {
      flex: 0 0 auto;
      min-width: 80px;
    }

    .modal-overlay {
      align-items: center;
      padding: var(--space-16);
    }

    .modal-content {
      max-width: 560px;
      max-height: 90vh;
      border-radius: var(--radius-2xl);
      padding: var(--space-24);
    }

    .form-actions,
    .dialog-actions {
      flex-direction: row;
      justify-content: flex-end;
    }

    .cancel-button,
    .save-button {
      width: auto;
      min-width: 120px;
    }
  }

  /* ============ Desktop (1024px+) ============ */
  @media (min-width: 1024px) {
    .main-content {
      max-width: 960px;
    }
  }
</style>
