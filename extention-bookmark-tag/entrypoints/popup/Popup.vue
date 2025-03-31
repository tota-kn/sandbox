<template>
  <div class="w-80 p-4 font-sans">
    <!-- ヘッダー部分を追加して右上にオプションリンクを配置 -->
    <div class="flex justify-between items-center mb-3">
      <div
        class="text-sm"
        :class="currentBookmark ? 'text-green-600' : 'text-gray-600'"
      >
        {{ message }}
      </div>
      <button 
        class="p-1.5 rounded-full hover:bg-gray-200 transition-colors" 
        title="Settings"
        @click="openOptionsPage"
      >
        <!-- 本のアイコン -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>
    </div>
    
    <div
      v-if="loading"
      class="text-gray-600"
    >
      Loading...
    </div>
    
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
              class="ml-1 text-blue-600 hover:text-blue-800 font-bold" 
              title="Remove tag"
              @click.stop="removeTag(tag)"
            >
              ×
            </button>
          </TagBadge>
          
          <!-- タグ追加ボタンを共通コンポーネントに置き換え -->
          <TagAddButton 
            :current-tags="currentTags"
            @add-tag="addTag"
          />
          
          <div
            v-if="currentTags.length === 0"
            class="text-sm text-gray-500 italic"
          >
            No tags
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          class="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          @click="saveBookmark"
        >
          {{ currentBookmark ? 'Update' : 'Add to Bookmarks' }}
        </button>
        
        <!-- ブックマーク削除ボタン（追加済みの場合のみ表示） -->
        <button 
          v-if="currentBookmark"
          class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
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
import { extractTags, addTagPrefix, removeTagFromTitle } from '../../utils/tagUtils';
import { getCurrentTabBookmark, updateBookmark as updateBookmarkUtil, createBookmark as createBookmarkUtil, deleteBookmark as deleteBookmarkUtil } from '../../utils/bookmarkUtils';

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
