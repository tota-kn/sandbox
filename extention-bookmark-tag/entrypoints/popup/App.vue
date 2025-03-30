<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue';
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

// タグ入力関連の状態
const newTag = ref('');
const tagSuggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const isAddingTag = ref(false); // タグ追加モードかどうか
const tagInput = ref<HTMLInputElement | null>(null);

// タグ入力に応じたサジェストを生成
const filterSuggestions = () => {
  if (!newTag.value) {
    tagSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  const input = newTag.value.toLowerCase().replace(/^@/, '');
  // すでに存在するタグから検索クエリに一致するものをフィルタリング
  const allExistingTags = chrome.bookmarks.search({}).then(allBookmarks => {
    const tagSet = new Set<string>();
    
    allBookmarks.forEach(bookmark => {
      const tags = extractTags(bookmark.title || '');
      tags.forEach(tag => {
        // @を除いた部分で比較
        const tagText = tag.slice(1).toLowerCase();
        if (tagText.includes(input)) {
          tagSet.add(tag);
        }
      });
    });
    
    // 現在すでに選択されているタグは除外
    const filteredTags = Array.from(tagSet).filter(tag => !currentTags.value.includes(tag));
    tagSuggestions.value = filteredTags;
    showSuggestions.value = filteredTags.length > 0;
  });
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
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      currentTab.value = tabs[0];
      bookmarkUrl.value = tabs[0].url || '';
      
      // このURLがブックマークされているか確認
      const bookmarks = await chrome.bookmarks.search({ url: bookmarkUrl.value });
      
      if (bookmarks && bookmarks.length > 0) {
        currentBookmark.value = bookmarks[0];
        bookmarkTitle.value = bookmarks[0].title || '';
        message.value = 'ブックマーク済み';
      } else {
        currentBookmark.value = null;
        bookmarkTitle.value = tabs[0].title || '';
        message.value = 'ブックマークされていません';
      }
    }
    loading.value = false;
  } catch (error) {
    console.error('タブ情報の取得に失敗しました:', error);
    message.value = 'エラーが発生しました';
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
  const tagToAdd = newTag.value.startsWith('@') ? newTag.value : `@${newTag.value}`;
  
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

// ブックマークを削除
const deleteBookmark = async () => {
  if (currentBookmark.value) {
    try {
      await chrome.bookmarks.remove(currentBookmark.value.id);
      message.value = 'ブックマークを削除しました';
      currentBookmark.value = null;
    } catch (error) {
      console.error('ブックマークの削除に失敗しました:', error);
      message.value = 'エラーが発生しました';
    }
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
              title="タグを削除"
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
              placeholder="新しいタグ" 
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
              title="タグを追加"
            >+</button>
          </div>
          
          <div v-if="currentTags.length === 0 && !isAddingTag" class="text-sm text-gray-500 italic">
            タグがありません
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
          {{ currentBookmark ? '更新' : 'ブックマークに追加' }}
        </button>
        
        <!-- ブックマーク削除ボタン（追加済みの場合のみ表示） -->
        <button 
          v-if="currentBookmark"
          @click="deleteBookmark"
          class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
          title="ブックマークを削除"
        >
          削除
        </button>
      </div>
    </div>
  </div>
</template>