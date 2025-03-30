<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import TagBadge from '../../components/TagBadge.vue';

// 現在のタブ情報
const currentTab = ref<chrome.tabs.Tab | null>(null);
const currentBookmark = ref<chrome.bookmarks.BookmarkTreeNode | null>(null);
const bookmarkTitle = ref('');
const bookmarkUrl = ref('');
const loading = ref(true);
const message = ref('');

// タイトルからタグを抽出する関数（@タグ形式）
const extractTags = (title: string): string[] => {
  const tagRegex = /(?:^|\s)(@[^\s]+)/g;
  const matches = [...title.matchAll(tagRegex)];
  return matches.map(match => match[1]);
};

// 表示中のタグ
const currentTags = computed(() => {
  return extractTags(bookmarkTitle.value);
});

// 新しいタグ
const newTag = ref('');

// 現在のタブ情報を取得
const getCurrentTab = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      currentTab.value = tabs[0];
      bookmarkUrl.value = tabs[0].url || '';
      
      // このURLがブックマークされているか確認
      const bookmarks = await chrome.bookmarks.search({ url: bookmarkUrl.value });
      
      if (bookmarks && bookmarks.length > 0) {
        currentBookmark.value = bookmarks[0];
        bookmarkTitle.value = bookmarks[0].title || '';
        message.value = 'ブックマーク済みのページです';
      } else {
        currentBookmark.value = null;
        bookmarkTitle.value = tabs[0].title || '';
        message.value = 'このページはブックマークされていません';
      }
    }
    loading.value = false;
  } catch (error) {
    console.error('タブ情報の取得に失敗しました:', error);
    message.value = 'エラーが発生しました';
    loading.value = false;
  }
};

// タグを追加
const addTag = () => {
  if (!newTag.value || newTag.value === '') return;
  
  // 先頭に@がなければ追加
  const tagToAdd = newTag.value.startsWith('@') ? newTag.value : `@${newTag.value}`;
  
  // すでに同じタグがあれば追加しない
  if (currentTags.value.includes(tagToAdd)) {
    newTag.value = '';
    return;
  }
  
  // タイトルにタグを追加
  bookmarkTitle.value = `${bookmarkTitle.value} ${tagToAdd}`;
  newTag.value = '';
};

// タグを削除
const removeTag = (tag: string) => {
  bookmarkTitle.value = bookmarkTitle.value.replace(tag, '').replace(/\s+/g, ' ').trim();
};

// ブックマークを保存または更新
const saveBookmark = async () => {
  try {
    if (currentBookmark.value) {
      // 既存ブックマークの更新
      await chrome.bookmarks.update(currentBookmark.value.id, {
        title: bookmarkTitle.value
      });
      message.value = 'ブックマークを更新しました';
    } else {
      // 新規ブックマーク作成
      await chrome.bookmarks.create({
        title: bookmarkTitle.value,
        url: bookmarkUrl.value
      });
      message.value = 'ブックマークに追加しました';
      
      // ブックマーク状態を更新
      const bookmarks = await chrome.bookmarks.search({ url: bookmarkUrl.value });
      if (bookmarks && bookmarks.length > 0) {
        currentBookmark.value = bookmarks[0];
      }
    }
  } catch (error) {
    console.error('ブックマークの保存に失敗しました:', error);
    message.value = 'エラーが発生しました';
  }
};

// コンポーネントのマウント時に現在のタブ情報を取得
onMounted(() => {
  getCurrentTab();
});
</script>

<template>
  <div class="w-80 p-4 font-sans">
    <div v-if="loading" class="text-gray-600">
      読み込み中...
    </div>
    
    <div v-else>
      <div class="mb-3 text-sm" :class="currentBookmark ? 'text-green-600' : 'text-gray-600'">
        {{ message }}
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
        <input 
          v-model="bookmarkTitle" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">タグ</label>
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
              title="タグを削除"
            >
              ×
            </button>
          </TagBadge>
          <div v-if="currentTags.length === 0" class="text-sm text-gray-500 italic">
            タグがありません
          </div>
        </div>
        
        <div class="flex mt-2">
          <input 
            v-model="newTag" 
            type="text" 
            placeholder="新しいタグ" 
            class="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            @keyup.enter="addTag"
          />
          <button 
            @click="addTag"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md"
          >
            追加
          </button>
        </div>
      </div>
      
      <button 
        @click="saveBookmark"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
      >
        {{ currentBookmark ? '更新' : 'ブックマークに追加' }}
      </button>
    </div>
  </div>
</template>