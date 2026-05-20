<script lang="ts">
  import { onMount } from 'svelte';
  import GachaScreen from './lib/components/GachaScreen.svelte';
  import SettingsScreen from './lib/components/SettingsScreen.svelte';
  import ErrorModal from './lib/components/ErrorModal.svelte';
  import { DataInitializer } from './lib/services/dataInitializer';
  import type { Screen } from './lib/types';

  // 画面状態管理
  let currentScreen = $state<Screen>('gacha');

  // 画面遷移ハンドラー
  function handleNavigate(event: CustomEvent<{ screen: Screen }>) {
    currentScreen = event.detail.screen;
  }

  // アプリケーション起動時にデータを初期化
  onMount(async () => {
    const dataInitializer = new DataInitializer();
    await dataInitializer.initialize();
  });
</script>

<div class="app">
  {#if currentScreen === 'gacha'}
    <GachaScreen onnavigate={handleNavigate} />
  {:else if currentScreen === 'settings'}
    <SettingsScreen onnavigate={handleNavigate} />
  {/if}

  <!-- エラーモーダル -->
  <ErrorModal />
</div>

<style>
  .app {
    width: 100%;
    min-height: 100vh;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--color-text-main);
    background-color: var(--color-surface-base);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>
