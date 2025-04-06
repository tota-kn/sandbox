<template>
  <button
    :class="[
      'rounded focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
      sizeClasses,
      variantClasses,
      fullWidth ? 'w-full' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * ボタンコンポーネントのプロパティ定義
 */
interface Props {
  /** ボタンのバリアント（見た目のスタイル） */
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  /** ボタンのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ボタンの幅を親要素に合わせるか */
  fullWidth?: boolean;
  /** ボタンの無効状態 */
  disabled?: boolean;
  /** ボタンのタイプ属性 */
  type?: 'button' | 'submit' | 'reset';
}

/** デフォルト値の設定 */
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  type: 'button',
});

/** サイズに応じたクラス */
const sizeClasses = computed((): string => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-1 text-xs';
    case 'lg':
      return 'px-5 py-3 text-base';
    case 'md':
    default:
      return 'px-4 py-2 text-sm';
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
    case 'link':
      return 'text-primary hover:underline px-0 py-0';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary-hover';
  }
});
</script>
