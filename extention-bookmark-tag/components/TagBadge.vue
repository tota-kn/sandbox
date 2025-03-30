<template>
  <span 
    @click="$emit('toggle')"
    :class="['tag-badge', { 'selected': selected }]"
  >
    {{ tag }}
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  tag: string;
  selected: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<style scoped>
.tag-badge {
  padding: 0.25rem 0.75rem !important;
  border-radius: 9999px !important;
  font-size: 0.875rem !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  background-color: #dbeafe !important; /* 非選択時の水色背景 */
  color: #1d4ed8 !important; /* 非選択時の文字色 */
  border: 1px solid #bfdbfe !important;
  display: inline-block !important;
}

.tag-badge:hover:not(.selected) {
  background-color: #bfdbfe !important;
}

.tag-badge.selected {
  background-color: #3b82f6 !important; /* 選択時の濃い水色背景 */
  color: white !important;
  border-color: #2563eb !important;
}
</style>