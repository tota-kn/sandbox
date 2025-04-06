<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
      sizeClasses,
      variantClasses,
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
import { computed } from 'vue';

/**
 * アイコンボタンのプロパティ定義
 */
interface Props {
  /** ボタンのバリアント（見た目のスタイル） */
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ボタンの無効状態 */
  disabled?: boolean;
  /** ボタンのタイプ属性 */
  type?: 'button' | 'submit' | 'reset';
  /** ボタンのツールチップテキスト */
  title?: string;
}

/** デフォルト値の設定 */
const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
  type: 'button',
  title: '',
});

/** サイズに応じたクラス */
const sizeClasses = computed((): string => {
  switch (props.size) {
    case 'sm':
      return 'p-1';
    case 'lg':
      return 'p-2.5';
    case 'md':
    default:
      return 'p-1.5';
  }
});

/** バリアントに応じたクラス */
const variantClasses = computed((): string => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary text-primary-foreground hover:bg-primary-hover';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary-hover';
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive-hover';
    case 'outline':
      return 'border border-border hover:bg-secondary text-foreground';
    case 'ghost':
      return 'hover:bg-secondary text-foreground';
    default:
      return 'hover:bg-secondary text-foreground';
  }
});
</script>