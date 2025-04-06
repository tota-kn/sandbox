<template>
  <div class="w-80 p-4 font-sans">
    <div class="flex justify-between items-center mb-3">
      <div
        class="text-sm"
        :class="currentBookmark ? 'text-primary' : 'text-muted'"
      >
        {{ message }}
      </div>
      <IconButton 
        title="Settings"
        @click="openOptionsPage"
      >
        <BookOpenIcon class="size-6" />
      </IconButton>
    </div>
    
    <LoadingIndicator v-if="loading" />
    
    <div v-else>
      <div class="mb-4">
        <input 
          v-model="bookmarkTitle" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
      </div>
      
      <div class="mb-4 relative">
        <div class="flex flex-wrap gap-2 mb-2">
          <TagBadge 
            v-for="tag in currentTags" 
            :key="tag"
            :tag="tag"
            :selected="false"
          >
            <button 
              class="ml-1 text-primary hover:text-primary-hover font-bold" 
              title="Remove tag"
              @click.stop="removeTag(tag)"
            >
              ×
            </button>
          </TagBadge>
          
          <TagAddButton 
            :current-tags="currentTags"
            @add-tag="addTag"
          />
          
          <div  
            v-if="currentTags.length === 0"
            class="py-5 text-gray-500 italic"
          >
            No tags
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          class="flex-grow bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 px-4 rounded-md"
          @click="saveBookmark"
        >
          {{ currentBookmark ? 'Update' : 'Add to Bookmarks' }}
        </button>
        
        <!-- ブックマーク削除ボタン（追加済みの場合のみ表示） -->
        <button 
          v-if="currentBookmark"
          class="flex-grow bg-destructive hover:bg-destructive-hover text-destructive-foreground font-medium py-2 px-4 rounded-md"
          title="Delete bookmark"
          @click="deleteBookmark"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import TagBadge from '../../components/TagBadge.vue';
import TagAddButton from '../../components/TagAddButton.vue';
import LoadingIndicator from '../../components/LoadingIndicator.vue';
import IconButton from '../../components/IconButton.vue';
import { extractTags, removeTagFromTitle } from '../../utils/tagUtils';
import { getCurrentTabBookmark, updateBookmark as updateBookmarkUtil, createBookmark as createBookmarkUtil, deleteBookmark as deleteBookmarkUtil } from '../../utils/bookmarkUtils';
import { BookOpenIcon } from '@heroicons/vue/24/outline';

/** 現在のタブオブジェクト */
const currentTab = ref<chrome.tabs.Tab | null>(null);

/** 現在のタブのブックマークオブジェクト（存在する場合） */
const currentBookmark = ref<chrome.bookmarks.BookmarkTreeNode | null>(null);

/** ブックマークのタイトル（タグを含む） */
const bookmarkTitle = ref('');

/** ブックマークのURL */
const bookmarkUrl = ref('');

/** データ読み込み中かどうか */
const loading = ref(true);

/** ユーザーへのメッセージ */
const message = ref('');

/** タイトルから抽出した現在表示中のタグリスト */
const currentTags = computed(() => {
  return extractTags(bookmarkTitle.value);
});

/** 現在のタブ情報を取得する */
const getCurrentTab = async (): Promise<void> => {
  try {
    loading.value = true;
    
    // utils/bookmarkUtils.tsの関数を使用
    const result = await getCurrentTabBookmark();
    currentTab.value = result.tab;
    currentBookmark.value = result.bookmark;
    bookmarkUrl.value = result.url;
    bookmarkTitle.value = result.title;
    
    message.value = currentBookmark.value ? 'Bookmarked' : 'Not bookmarked';
    loading.value = false;
  } catch (error) {
    console.error('タブ情報の取得に失敗しました:', error);
    message.value = 'Error occurred';
    loading.value = false;
  }
};

/** 新しいタグをブックマークに追加する
 * @param tag - 追加するタグ
 */
const addTag = (tag: string): void => {
  // すでに同じタグがあれば追加しない
  const tagWithoutPrefix = tag.startsWith('@') ? tag.slice(1) : tag;
  if (currentTags.value.includes(tagWithoutPrefix)) {
    return;
  }
  
  // タイトルにタグを追加
  bookmarkTitle.value = `${bookmarkTitle.value} ${tag}`;
};

/** 指定したタグをブックマークから削除する
 * @param tag - 削除するタグ
 */
const removeTag = (tag: string): void => {
  bookmarkTitle.value = removeTagFromTitle(bookmarkTitle.value, tag);
};

/** 既存のブックマークを更新する */
const updateBookmark = async (): Promise<void> => {
  try {
    if (!currentBookmark.value || !currentBookmark.value.id) {
      throw new Error('Bookmark not found');
    }
    
    // utils/bookmarkUtils.tsの関数を使用
    const result = await updateBookmarkUtil(currentBookmark.value.id, bookmarkTitle.value);
    message.value = result.message;
  } catch (error) {
    console.error('ブックマークの更新に失敗しました:', error);
    message.value = 'Error occurred';
  }
};

/** 新しいブックマークを作成する */
const createBookmark = async (): Promise<void> => {
  try {
    // utils/bookmarkUtils.tsの関数を使用
    const result = await createBookmarkUtil(bookmarkTitle.value, bookmarkUrl.value);
    
    if (result.success && result.bookmark) {
      currentBookmark.value = result.bookmark;
    }
    
    message.value = result.message;
    
    // 再度情報を取得して更新
    if (result.success) {
      await getCurrentTab();
    }
  } catch (error) {
    console.error('ブックマークの作成に失敗しました:', error);
    message.value = 'Error occurred';
  }
};

/** ブックマークを保存（新規作成または更新）する */
const saveBookmark = (): void => {
  if (currentBookmark.value) {
    updateBookmark();
  } else {
    createBookmark();
  }
};

/** ブックマークを削除する */
const deleteBookmark = async (): Promise<void> => {
  try {
    if (!currentBookmark.value || !currentBookmark.value.id) {
      throw new Error('Bookmark not found');
    }
    
    // utils/bookmarkUtils.tsの関数を使用
    const result = await deleteBookmarkUtil(currentBookmark.value.id);
    
    if (result.success) {
      // 状態リセット
      currentBookmark.value = null;
    }
    
    message.value = result.message;
  } catch (error) {
    console.error('ブックマークの削除に失敗しました:', error);
    message.value = 'Error occurred';
  }
};

/** オプションページを開く処理 */
const openOptionsPage = (): void => {
  chrome.runtime.openOptionsPage();
};

// コンポーネントのマウント時にタブ情報を取得
onMounted(() => {
  getCurrentTab();
});
</script>
