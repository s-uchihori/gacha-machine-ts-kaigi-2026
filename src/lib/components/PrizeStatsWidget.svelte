<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';

  // Services
  const prizeDisplayService = new PrizeDisplayService();

  // Derived state
  let stats = $derived.by(() => {
    // prizesStore.prizesを参照することでリアクティビティを確保
    prizesStore.prizes;
    return prizeDisplayService.getStats();
  });
</script>

<div class="stats-widget">
  <h3 class="stats-title">景品統計</h3>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">登録景品</div>
      <div class="stat-value">{stats.totalCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">在庫あり</div>
      <div class="stat-value">{stats.availableCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">在庫切れ</div>
      <div class="stat-value">{stats.outOfStockCount}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">残り在庫</div>
      <div class="stat-value">{stats.remainingStock}</div>
      <div class="stat-unit">個</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">仕入れ総数</div>
      <div class="stat-value">{stats.totalStockCapacity}</div>
      <div class="stat-unit">個</div>
    </div>
  </div>

  {#if stats.outOfStockCount > 0}
    <div class="warning-message">
      ⚠️ 在庫切れの景品があります
    </div>
  {/if}
</div>

<style>
  .stats-widget {
    padding: var(--space-16);
    background: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-lg);
  }

  .stats-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-main);
    margin: 0 0 var(--space-12) 0;
  }

  /* SP: 2列固定 */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-12);
    background: var(--color-surface-base);
    border-radius: var(--radius-md);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
    margin-bottom: var(--space-4);
    text-align: center;
  }

  .stat-value {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text-main);
    line-height: var(--line-height-tight);
  }

  .stat-unit {
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
    margin-top: var(--space-2);
  }

  .warning-message {
    margin-top: var(--space-12);
    padding: var(--space-12) var(--space-16);
    background: var(--color-state-warning);
    color: var(--color-text-main);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-align: center;
  }

  /* ============ Tablet (600px+) ============ */
  @media (min-width: 600px) {
    .stats-widget {
      padding: var(--space-20);
    }

    .stats-title {
      font-size: var(--font-size-lg);
    }

    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--space-12);
    }

    .stat-card {
      padding: var(--space-16);
    }

    .stat-value {
      font-size: var(--font-size-3xl);
    }
  }
</style>
