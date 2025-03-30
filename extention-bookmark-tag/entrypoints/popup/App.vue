<template>
  <div class="w-80 p-4 font-sans">
    <div v-if="loading" class="text-gray-600">
      Loading...
    </div>
    
    <div v-else>
      <div class="mb-3 text-sm" :class="currentBookmark ? 'text-green-600' : 'text-gray-600'">
        {{ message }}
      </div>
      
      <div class="mb-4">
        <input 
          v-model="bookmarkTitle" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
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
              @click.stop="removeTag(tag)" 
              class="ml-1 text-blue-600 hover:text-blue-800 font-bold"
              title="Remove tag"
            >
              ×
            </button>
          </TagBadge>
          
          <!-- タグ追加ボタンまたは入力欄 -->
          <div class="inline-flex items-center">
            <input 
              v-if="isAddingTag" 
              v-model="newTag" 
              type="text" 
              placeholder="New tag" 
              class="border border-gray-300 rounded-full text-xs p-1 px-2 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500" 
              ref="tagInput"
              @keyup.enter="addTag"
              @input="filterSuggestions"
              @blur="isAddingTag = false"
            />
            <button 
              v-else 
              @click="startAddingTag" 
              class="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-xs"
              title="Add tag"
            >+</button>
          </div>
          
          <div v-if="currentTags.length === 0 && !isAddingTag" class="text-sm text-gray-500 italic">
            No tags
          </div>
        </div>
        
        <!-- サジェスト表示エリア -->
        <div v-if="showSuggestions" class="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10 max-h-40 overflow-y-auto shadow-md">
          <div v-for="suggestion in tagSuggestions" :key="suggestion" class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="selectSuggestion(suggestion)">
            {{ suggestion }}
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="saveBookmark"
          class="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        >
          {{ currentBookmark ? 'Update' : 'Add to Bookmarks' }}
        </button>
        
        <!-- ブックマーク削除ボタン（追加済みの場合のみ表示） -->
        <button 
          v-if="currentBookmark"
          @click="deleteBookmark"
          class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
          title="Delete bookmark"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import TagBadge from '../../components/TagBadge.vue';
import { extractTags, addTagPrefix, removeTagFromTitle } from '../../utils/tagUtils';
import { getCurrentTabBookmark, updateBookmark as updateBookmarkUtil, createBookmark as createBookmarkUtil, deleteBookmark as deleteBookmarkUtil, generateTagSuggestions } from '../../utils/bookmarkUtils';

// 現在のタブ情報
const currentTab = ref<chrome.tabs.Tab | null>(null);
const currentBookmark = ref<chrome.bookmarks.BookmarkTreeNode | null>(null);
const bookmarkTitle = ref('');
const bookmarkUrl = ref('');
const loading = ref(true);
const message = ref('');

// 表示中のタグ
const currentTags = computed(() => {
  return extractTags(bookmarkTitle.value);
});

// タグ入力関連の状態
const newTag = ref('');
const tagSuggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const isAddingTag = ref(false); // タグ追加モードかどうか
const tagInput = ref<HTMLInputElement | null>(null);

// タグ入力に応じたサジェストを生成
const filterSuggestions = async () => {
  if (!newTag.value) {
    tagSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // utils/bookmarkUtils.tsの関数を使用
  const suggestions = await generateTagSuggestions(newTag.value, currentTags.value);
  tagSuggestions.value = suggestions;
  showSuggestions.value = suggestions.length > 0;
};

// サジェストからタグを選択
const selectSuggestion = (tag: string) => {
  const tagToAdd = tag;
  bookmarkTitle.value = `${bookmarkTitle.value} ${tagToAdd}`;
  newTag.value = '';
  showSuggestions.value = false;
  tagSuggestions.value = [];
};

// 現在のタブ情報を取得
const getCurrentTab = async () => {
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

// タグの追加モードを開始
const startAddingTag = async () => {
  isAddingTag.value = true;
  newTag.value = '';
  showSuggestions.value = false;
  await nextTick();
  tagInput.value?.focus();
};

// タグを追加
const addTag = () => {
  if (!newTag.value || newTag.value === '') {
    isAddingTag.value = false;
    return;
  }
  
  // 先頭に@がなければ追加
  const tagToAdd = addTagPrefix(newTag.value);
  
  // すでに同じタグがあれば追加しない
  if (currentTags.value.includes(tagToAdd)) {
    newTag.value = '';
    isAddingTag.value = false;
    showSuggestions.value = false;
    return;
  }
  
  // タイトルにタグを追加
  bookmarkTitle.value = `${bookmarkTitle.value} ${tagToAdd}`;
  newTag.value = '';
  isAddingTag.value = false;
  showSuggestions.value = false;
};

// タグを削除
const removeTag = (tag: string) => {
  bookmarkTitle.value = removeTagFromTitle(bookmarkTitle.value, tag);
};

// 既存のブックマークを更新
const updateBookmark = async () => {
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

// 新しいブックマークを作成
const createBookmark = async () => {
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

// ブックマークを保存（新規作成または更新）
const saveBookmark = () => {
  if (currentBookmark.value) {
    updateBookmark();
  } else {
    createBookmark();
  }
};

// ブックマークを削除
const deleteBookmark = async () => {
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

// コンポーネントのマウント時にタブ情報を取得
onMounted(() => {
  getCurrentTab();
});
</script>
