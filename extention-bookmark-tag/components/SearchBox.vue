<template>
  <div class="relative">
    <input 
      :value="modelValue"
      :placeholder="placeholder"
      type="text"
      class="w-full p-2 pl-10 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <MagnifyingGlassIcon class="size-4 text-muted" />
    </div>
    <button 
      v-if="modelValue"
      class="absolute inset-y-0 right-0 pr-3 flex items-center" 
      @click="$emit('update:modelValue', '')"
    >
      <XMarkIcon class="size-4 text-muted hover:text-foreground" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';

/**
 * SearchBoxコンポーネントのプロパティ定義
 */
defineProps<{
  /** 入力値（v-modelで連携） */
  modelValue: string
  /** 入力欄のプレースホルダーテキスト */
  placeholder?: string
}>()

/**
 * 親コンポーネントに通知するイベント
 */
defineEmits<{
  /**
   * 入力値が変更されたときに発火するイベント
   * @param value 新しい入力値
   */
  (e: 'update:modelValue', value: string): void
}>()
</script>