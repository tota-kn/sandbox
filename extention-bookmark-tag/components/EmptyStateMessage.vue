<template>
  <div class="py-5 text-gray-500 italic">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
/**
 * データが存在しない時に表示するメッセージコンポーネント
 * @param {string} message 表示するメッセージ
 */
defineProps<{
  /** 表示するメッセージ */
  message: string
}>()
</script>