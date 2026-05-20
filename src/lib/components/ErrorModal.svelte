<script lang="ts">
  import { errorStore } from '../stores/error.svelte';

  function closeModal() {
    errorStore.clearError();
  }

  // 詳細を表示するかどうか
  let showDetails = $state(false);

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

{#if errorStore.hasError && errorStore.currentError}
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="error-modal">
        <div class="error-header">
          <h2>⚠️ {errorStore.currentError.title}</h2>
        </div>

        <div class="error-body">
          <p class="error-message">{errorStore.currentError.message}</p>

          {#if errorStore.currentError.details}
            <div class="error-details-section">
              <button class="details-toggle" onclick={toggleDetails}>
                {showDetails ? '▼' : '▶'} 詳細を{showDetails ? '非表示' : '表示'}
              </button>

              {#if showDetails}
                <div class="error-details">
                  <pre>{errorStore.currentError.details}</pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <div class="error-footer">
          <button class="close-button" onclick={closeModal}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* SP: bottom-sheet 化 */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--color-overlay);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 2000;
  }

  .modal-content {
    background-color: var(--color-surface-white);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    padding: var(--space-20);
    max-width: 100%;
    width: 100%;
    max-height: 100vh;
    overflow-y: auto;
  }

  .error-modal {
    display: flex;
    flex-direction: column;
    gap: var(--space-20);
  }

  .error-header h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-state-error);
  }

  .error-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .error-message {
    margin: 0;
    font-size: var(--font-size-base);
    color: var(--color-text-main);
    line-height: var(--line-height-relaxed);
  }

  .error-details-section {
    margin-top: var(--space-12);
  }

  .details-toggle {
    min-height: 44px;
    padding: var(--space-8) var(--space-12);
    background-color: var(--color-surface-base);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-text-main);
    width: 100%;
    text-align: left;
  }

  .details-toggle:hover {
    background-color: var(--color-state-highlight);
  }

  .error-details {
    margin-top: var(--space-8);
    padding: var(--space-12);
    background-color: var(--color-surface-base);
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-md);
    max-height: 200px;
    overflow-y: auto;
  }

  .error-details pre {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-text-sub);
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', monospace;
  }

  /* SP: ボタンは縦並び・全幅 */
  .error-footer {
    display: flex;
    flex-direction: column;
  }

  .close-button {
    width: 100%;
    min-height: 48px;
    padding: var(--space-12) var(--space-32);
    font-size: var(--font-size-base);
    font-weight: bold;
    background-color: var(--color-brand-red);
    color: var(--color-text-white);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .close-button:hover {
    opacity: 0.9;
  }

  /* ============ Tablet (600px+): centered modal + 横並びボタン ============ */
  @media (min-width: 600px) {
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

    .error-header h2 {
      font-size: var(--font-size-2xl);
    }

    .error-footer {
      flex-direction: row;
      justify-content: flex-end;
    }

    .close-button {
      width: auto;
      min-width: 140px;
    }
  }
</style>
