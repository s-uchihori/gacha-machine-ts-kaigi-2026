<script lang="ts">
  import { prizesStore } from '../stores/prizes.svelte';
  import { PrizeDisplayService } from '../services/prizeDisplayService';
  import { RarityClassifier } from '../services/rarityClassifier';

  // Props
  interface Props {
    isOpen: boolean;
    prizeId: string | null;
    onClose: () => void;
  }

  let { isOpen, prizeId, onClose }: Props = $props();

  // Services
  const prizeDisplayService = new PrizeDisplayService();
  const rarityClassifier = new RarityClassifier();

  // Derived state
  let displayInfo = $derived.by(() => {
    if (!isOpen || !prizeId) return null;

    try {
      return prizeDisplayService.getPrizeDisplayInfo(prizeId);
    } catch (e) {
      return null;
    }
  });

  // Event handlers
  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleCloseClick() {
    onClose();
  }
</script>

{#if isOpen && displayInfo}
  <div class="modal-overlay" onclick={handleOverlayClick} role="presentation">
    <div class="modal-content">
      <button class="close-button" onclick={handleCloseClick} aria-label="閉じる">
        ×
      </button>

      <div class="prize-detail">
        <div class="prize-image-container">
          <img
            src={displayInfo.prize.imageUrl}
            alt={displayInfo.prize.name}
            class="prize-image"
          />
        </div>

        <div class="prize-header">
          <span
            class="rarity-icon"
            style="color: {rarityClassifier.getColor(displayInfo.rarity)}"
          >
            {rarityClassifier.getIcon(displayInfo.rarity)}
          </span>
          <h2 class="prize-name">{displayInfo.prize.name}</h2>
        </div>

        <div class="prize-stats">
          <div class="stat-item">
            <span class="stat-label">確率</span>
            <span class="stat-value">{displayInfo.probability}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在庫</span>
            <span class="stat-value">
              {displayInfo.prize.stock} / {displayInfo.prize.totalStock ?? displayInfo.prize.stock}個
            </span>
          </div>
        </div>

        {#if displayInfo.prize.description}
          <div class="prize-description">
            <h3 class="description-label">説明</h3>
            <p class="description-text">{displayInfo.prize.description}</p>
          </div>
        {/if}

        {#if displayInfo.isLowStock && displayInfo.prize.stock > 0}
          <div class="low-stock-notice">残りわずかです!</div>
        {/if}

        {#if displayInfo.prize.stock === 0}
          <div class="out-of-stock-notice">在庫切れです</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* SP: bottom-sheet 化 */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--color-surface-white);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    max-width: 100%;
    width: 100%;
    max-height: 100vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .close-button {
    position: absolute;
    top: var(--space-12);
    right: var(--space-12);
    background: transparent;
    border: none;
    font-size: var(--font-size-2xl);
    line-height: 1;
    cursor: pointer;
    color: var(--color-text-sub);
    padding: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  .close-button:hover {
    color: var(--color-text-main);
    background-color: var(--color-state-highlight);
  }

  .prize-detail {
    padding: var(--space-20);
  }

  /* SP: 縦長すぎないよう 4/3 にする */
  .prize-image-container {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface-base);
    margin-bottom: var(--space-16);
  }

  .prize-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .prize-header {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    margin-bottom: var(--space-16);
  }

  .rarity-icon {
    font-size: var(--font-size-2xl);
    line-height: 1;
  }

  .prize-name {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text-main);
    margin: 0;
  }

  .prize-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-12);
    margin-bottom: var(--space-16);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-12);
    background: var(--color-surface-base);
    border-radius: var(--radius-lg);
  }

  .stat-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
  }

  .stat-value {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-main);
  }

  .prize-description {
    margin-bottom: var(--space-16);
  }

  .description-label {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-main);
    margin: 0 0 var(--space-8) 0;
  }

  .description-text {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-sub);
    margin: 0;
  }

  .low-stock-notice {
    padding: var(--space-12) var(--space-16);
    background: var(--color-state-warning);
    color: var(--color-text-main);
    border-radius: var(--radius-md);
    font-weight: 600;
    text-align: center;
    margin-top: var(--space-12);
  }

  .out-of-stock-notice {
    padding: var(--space-12) var(--space-16);
    background: var(--color-surface-middle);
    color: var(--color-text-sub);
    border-radius: var(--radius-md);
    font-weight: 600;
    text-align: center;
    margin-top: var(--space-12);
  }

  /* ============ Tablet (600px+): centered modal ============ */
  @media (min-width: 600px) {
    .modal-overlay {
      align-items: center;
      padding: var(--space-16);
    }

    .modal-content {
      max-width: 560px;
      max-height: 90vh;
      border-radius: var(--radius-2xl);
    }

    .prize-detail {
      padding: var(--space-24);
    }

    .prize-image-container {
      aspect-ratio: 1 / 1;
    }

    .prize-name {
      font-size: var(--font-size-2xl);
    }

    .stat-label {
      font-size: var(--font-size-sm);
    }

    .stat-value {
      font-size: var(--font-size-lg);
    }

    .description-text {
      font-size: var(--font-size-base);
    }
  }
</style>
