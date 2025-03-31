<template>
  <div class="inline-flex items-center relative">
    <input 
      v-if="isAddingTag" 
      ref="tagInput" 
      v-model="newTagInput" 
      type="text" 
      :placeholder="placeholder" 
      class="border border-gray-300 rounded-full text-xs p-1 px-2 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
      @keyup.enter.prevent="addTag"
      @input="filterSuggestions"
      @blur="handleBlur"
    >
    <button 
      v-else 
      class="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-xs" 
      :title="buttonTitle"
      @click="startAddingTag"
    >
      +
    </button>
    
    <!-- サジェスト表示エリア -->
    <div 
      v-if="showSuggestions" 
      class="absolute bg-white border border-gray-300 rounded-md my-2 w-48 z-10 max-h-32 overflow-y-auto shadow-md top-full left-0"
    >
      <div 
        v-for="suggestion in tagSuggestions" 
        :key="suggestion" 
        class="px-3 py-1 hover:bg-gray-100 cursor-pointer" 
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { generateTagSuggestions } from '../utils/bookmarkUtils';
import { addTagPrefix } from '../utils/tagUtils';

/** このコンポーネントのプロパティ定義 */
interface Props {
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** ボタンのツールチップテキスト */
  buttonTitle?: string;
  /** 現在のタグリスト（サジェスト生成に使用） */
  currentTags?: string[];
  /** サジェストリストの位置（top, right, bottom, leftのCSSプロパティ） */
  suggestionsPosition?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  }
}

/** propsのデフォルト値を設定 */
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'New tag',
  buttonTitle: 'Add tag',
  currentTags: () => [],
  suggestionsPosition: () => ({})
});

/**
 * 親コンポーネントに通知するイベント
 */
const emit = defineEmits<{
  /**
   * タグ追加イベント
   * @param tag 追加するタグ（@プレフィックス付き）
   */
  (e: 'add-tag', tag: string): void
}>()

/** タグ入力中かどうかのフラグ */
const isAddingTag = ref(false);
/** 新しいタグの入力値 */
const newTagInput = ref('');
/** タグ入力フィールドのref */
const tagInput = ref<HTMLInputElement | null>(null);
/** サジェスト表示フラグ */
const showSuggestions = ref(false);
/** タグサジェスト候補リスト */
const tagSuggestions = ref<string[]>([]);
/** サジェスト選択中のフラグ */
const isSelectingSuggestion = ref(false);

/** サジェストリストの位置スタイル */
const suggestionsPositionStyle = computed(() => props.suggestionsPosition);

/** タグ入力モードを開始する */
const startAddingTag = async (): Promise<void> => {
  isAddingTag.value = true;
  newTagInput.value = '';
  showSuggestions.value = false;
  await nextTick();
  tagInput.value?.focus();
};

/** タグ入力に応じたサジェストを生成する */
const filterSuggestions = async (): Promise<void> => {
  if (!newTagInput.value) {
    tagSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // utils/bookmarkUtils.tsの関数を使用
  const suggestions = await generateTagSuggestions(newTagInput.value, props.currentTags);
  tagSuggestions.value = suggestions;
  showSuggestions.value = suggestions.length > 0;
};

/** サジェストからタグを選択する */
const selectSuggestion = (tag: string): void => {
  isSelectingSuggestion.value = true;
  
  // 親コンポーネントにイベント発火
  emit('add-tag', tag);
  
  // 状態をリセット
  newTagInput.value = '';
  showSuggestions.value = false;
  isAddingTag.value = false;
  
  // フラグをリセット
  setTimeout(() => {
    isSelectingSuggestion.value = false;
  }, 100);
};

/** 入力フォーカスが外れた時の処理 */
const handleBlur = (): void => {
  // サジェスト選択中の場合は何もしない（サジェスト選択時のblurイベントを無視）
  if (isSelectingSuggestion.value) {
    return;
  }
  
  // 入力フォームを閉じる
  setTimeout(() => {
    isAddingTag.value = false;
    showSuggestions.value = false;
  }, 150); // サジェスト選択ができるように少し遅延
};

/** 新しいタグを追加する */
const addTag = (): void => {
  if (!newTagInput.value || newTagInput.value === '') {
    isAddingTag.value = false;
    return;
  }
  
  // 先頭に@がなければ追加
  const tagToAdd = addTagPrefix(newTagInput.value);
  
  // 親コンポーネントにイベント発火
  emit('add-tag', tagToAdd);
  
  console.log('addTag called with:', tagToAdd); // デバッグログ
  
  // 状態をリセット
  newTagInput.value = '';
  isAddingTag.value = false;
  showSuggestions.value = false;
};

// デバッグ用: 外部からのイベント発火を確認
watch(() => props.currentTags, () => {
  console.log('currentTags changed:', props.currentTags);
}, { deep: true });
</script>