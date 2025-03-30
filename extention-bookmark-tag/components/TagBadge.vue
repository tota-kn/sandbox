<template>
  <span 
    @click="$emit('toggle')"
    :class="[
      // 共通スタイル
      'px-3',
      'py-1',
      'rounded-full',
      'text-sm',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'inline-block',
      
      // 選択状態に応じたスタイル
      props.selected ? [
        'bg-blue-500',
        'text-white',
        'border',
        'border-blue-600'
      ] : [
        'bg-blue-100',
        'text-blue-700',
        'border',
        'border-blue-200',
        'hover:bg-blue-200'
      ]
    ]"
  >
    {{ props.tag }}
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tag: string;
  selected: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>