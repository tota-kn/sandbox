<template>
  <div class="flex items-center justify-between mb-3">
    <h2 class="text-xl font-semibold mr-4">
      <slot />
    </h2>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
// サブヘッダーとアクションボタンを配置できるコンポーネント
// デフォルトスロットはヘッダーテキスト用、actionsスロットは右側のアクション要素用
</script>
