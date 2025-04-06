<template>
  <button
    :class="[
      'inline-flex items-center justify-center text-secondary-foreground hover:text-primary',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :type="type"
    :disabled="disabled"
    :title="title"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
/**
 * アイコンボタンのプロパティ定義
 */
interface Props {
  /** ボタンの無効状態 */
  disabled?: boolean;
  /** ボタンのタイプ属性 */
  type?: 'button' | 'submit' | 'reset';
  /** ボタンのツールチップテキスト */
  title?: string;
}

/** デフォルト値の設定 */
withDefaults(defineProps<Props>(), {
  disabled: false,
  type: 'button',
  title: '',
});
</script>