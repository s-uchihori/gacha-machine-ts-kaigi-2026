<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { FilterStore } from '../stores/filter.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';

  // Props
  interface Props {
    mode: 'compact' | 'detailed';
    onPrizeClick?: (prizeId: string) => void;
    showControls?: boolean;
  }

  let { mode, onPrizeClick, showControls = false }: Props = $props();

  // Services
  const prizeDisplayService = new PrizeDisplayService();

  // State
  let prizes = $derived(prizesStore.prizes);
  let displayInfoList = $derived.by(() => {
    if (prizes.length === 0) return [];
    // FilterStoreの設定を参照することでリアクティビティを確保
    FilterStore.sortBy;
    FilterStore.sortOrder;
    FilterStore.rarityFilter;
    FilterStore.showOutOfStock;
    return prizeDisplayService.getFilteredAndSortedPrizeDisplayInfo();
  });

  // Event handlers
  function handlePrizeClick(prizeId: string) {
    if (onPrizeClick) {
      onPrizeClick(prizeId);
    }
  }
</script>

<div class="prize-list-widget">
  {#if displayInfoList.length === 0}
    <div class="empty-message">景品が設定されていません</div>
  {:else}
    {#if showControls}
      <div class="controls">
        <span>ソート</span>
      </div>
    {/if}

    <div class={`prize-list-${mode}`}>
      {#each displayInfoList as info (info.prize.id)}
        <div
          class="prize-item"
          class:out-of-stock={info.prize.stock === 0}
          data-testid={`prize-${info.prize.id}`}
          onclick={() => handlePrizeClick(info.prize.id)}
          onkeydown={(e) => e.key === 'Enter' && handlePrizeClick(info.prize.id)}
          role="button"
          tabindex="0"
        >
          <div class="prize-column image">
            <div class="thumbnail">
              {#if info.prize.imageUrl}
                <img src={info.prize.imageUrl} alt={info.prize.name} loading="lazy" />
              {:else}
                <div class="thumbnail-placeholder">No Image</div>
              {/if}
            </div>
          </div>

          <div class="prize-column meta">
            <div class="prize-header">
              <span class="prize-name">{info.prize.name}</span>
            </div>

            <div class="prize-info">
              <span class="stock">
                {info.prize.stock}/{info.prize.totalStock ?? info.prize.stock}個
              </span>
              <span class="probability">{info.probability}%</span>
              {#if info.isLowStock && info.prize.stock > 0}
                <span class="low-stock-warning">残りわずか</span>
              {/if}
            </div>

            {#if mode === 'detailed' && info.prize.description}
              <div class="prize-description">{info.prize.description}</div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .prize-list-widget {
    padding: 0;
  }

  .empty-message {
    text-align: center;
    color: var(--color-text-sub);
    padding: var(--space-32);
    font-size: var(--font-size-sm);
  }

  .controls {
    margin-bottom: var(--space-12);
    padding: var(--space-8);
    background: var(--color-surface-base);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--color-text-sub);
  }

  /* SP: 横長1列 (画像左・メタ右) */
  .prize-list-compact,
  .prize-list-detailed {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .prize-item {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    background: var(--color-surface-white);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-xl);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }

  .prize-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .prize-item.out-of-stock {
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .prize-item.out-of-stock::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(28, 30, 34, 0.45);
    pointer-events: none;
  }

  .prize-name {
    font-weight: 700;
    color: var(--color-text-main);
    flex: 1;
    font-size: var(--font-size-base);
    line-height: var(--line-height-tight);
  }

  .prize-info {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-8);
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
  }

  .probability {
    font-weight: 600;
    color: var(--color-text-main);
  }

  .stock {
    color: var(--color-text-main);
    font-weight: 600;
  }

  .low-stock-warning {
    color: var(--color-state-error);
    font-weight: 600;
    font-size: var(--font-size-xs);
  }

  .prize-description {
    margin: 0;
    padding-top: var(--space-8);
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
    line-height: var(--line-height-base);
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    aspect-ratio: 1 / 1;
    background: var(--color-surface-middle);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
  }

  .prize-column.image {
    flex: 0 0 auto;
    width: 88px;
    background: var(--color-surface-middle);
  }

  .prize-column.meta {
    padding: var(--space-12);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-6);
    flex: 1;
    min-width: 0;
  }

  .prize-header {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-8);
  }

  /* ============ Tablet (600px+): サムネを拡大、余白を増やす ============ */
  @media (min-width: 600px) {
    .prize-list-compact,
    .prize-list-detailed {
      gap: var(--space-12);
    }

    .prize-column.image {
      width: 112px;
    }

    .prize-column.meta {
      padding: var(--space-16);
      gap: var(--space-8);
    }

    .prize-name {
      font-size: var(--font-size-lg);
    }

    .prize-info {
      font-size: var(--font-size-sm);
      gap: var(--space-12);
    }
  }
</style>
