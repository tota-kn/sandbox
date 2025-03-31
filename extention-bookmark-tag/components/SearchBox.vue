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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <button 
      v-if="modelValue"
      class="absolute inset-y-0 right-0 pr-3 flex items-center" 
      @click="$emit('update:modelValue', '')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-400 hover:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
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