<template>
  <div class="max-w-3xl mx-auto p-5 font-sans">
    <h1 class="text-2xl font-bold text-gray-800 pb-3 mb-4 border-b-2 border-gray-100">ブックマークタグ管理</h1>
    
    <div class="mb-6">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="タグまたはブックマーク名で検索" 
        class="w-full p-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-3">タグ一覧</h2>
      <div class="flex items-center gap-3 mb-3">
        <span>検索モード：</span>
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="radio" v-model="searchMode" value="or" class="form-radio text-blue-600" />
          <span>OR（いずれか含む）</span>
        </label>
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="radio" v-model="searchMode" value="and" class="form-radio text-blue-600" />
          <span>AND（すべて含む）</span>
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <TagBadge 
          v-for="tag in uniqueTags" 
          :key="tag"
          :tag="tag"
          :selected="selectedTags.includes(tag)"
          @toggle="toggleTag(tag)"
        />
      </div>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-3">ブックマーク一覧</h2>
      <div v-if="loading" class="py-4">読み込み中...</div>
      <div v-else-if="filteredBookmarks.length === 0" class="py-5 text-gray-500 italic">
        表示するブックマークがありません
      </div>
      <ul v-else class="list-none p-0">
        <BookmarkItem 
          v-for="bookmark in filteredBookmarks"
          :key="bookmark.id"
          :bookmark="bookmark"
          @update-title="updateBookmarkTitle"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TagBadge from '../../components/TagBadge.vue'
import BookmarkItem from '../../components/BookmarkItem.vue'

// ブックマークの型定義
interface Bookmark {
  id: string
  title: string
  url?: string
  children?: Bookmark[]
}

const bookmarks = ref<Bookmark[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const searchMode = ref<'and' | 'or'>('or')

// ブックマークを取得する関数
const fetchBookmarks = async () => {
  try {
    // Chrome拡張のブックマークAPIを使用
    const results = await chrome.bookmarks.getTree()
    // 取得したツリー構造を平坦化
    bookmarks.value = flattenBookmarks(results)
    loading.value = false
  } catch (error) {
    console.error('ブックマークの取得に失敗しました:', error)
    loading.value = false
  }
}

// ブックマークの階層構造を平坦化する関数
const flattenBookmarks = (bookmarkItems: Bookmark[]): Bookmark[] => {
  let result: Bookmark[] = []
  
  for (const item of bookmarkItems) {
    if (item.url) {
      result.push(item)
    }
    
    if (item.children) {
      result = result.concat(flattenBookmarks(item.children))
    }
  }
  
  return result
}

// タイトルからタグを抽出する関数（@タグ形式）
const extractTags = (title: string): string[] => {
  const tagRegex = /(?:^|\s)(@[^\s]+)/g
  const matches = [...title.matchAll(tagRegex)]
  return matches.map(match => match[1])
}

// タグを切り替える
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// フィルタリングされたブックマーク
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value
  
  // 検索クエリでフィルタリング
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(bookmark => 
      bookmark.title.toLowerCase().includes(query) || 
      bookmark.url?.toLowerCase().includes(query)
    )
  }
  
  // タグでフィルタリング
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(bookmark => {
      const bookmarkTags = extractTags(bookmark.title)
      
      if (searchMode.value === 'or') {
        // OR検索: 選択したタグのうち少なくとも1つが含まれている
        return selectedTags.value.some(tag => bookmarkTags.includes(tag))
      } else {
        // AND検索: 選択したタグすべてが含まれている
        return selectedTags.value.every(tag => bookmarkTags.includes(tag))
      }
    })
  }
  
  return filtered
})

// 全てのユニークなタグを抽出
const uniqueTags = computed(() => {
  const allTags = bookmarks.value.flatMap(bookmark => extractTags(bookmark.title))
  return [...new Set(allTags)]
})

// ブックマークのタイトルを更新する
const updateBookmarkTitle = async (bookmarkId: string, newTitle: string) => {
  try {
    await chrome.bookmarks.update(bookmarkId, {
      title: newTitle
    })
    
    // ローカルのブックマークデータを更新
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      bookmark.title = newTitle
    }
    
    // 選択中のタグが削除された場合、フィルターをクリア
    const currentTags = extractTags(newTitle)
    selectedTags.value = selectedTags.value.filter(tag => currentTags.includes(tag) || 
      bookmarks.value.some(b => b.id !== bookmarkId && extractTags(b.title).includes(tag)))
  } catch (error) {
    console.error('ブックマークの更新に失敗しました:', error)
  }
}

// コンポーネントのマウント時にブックマークを取得
onMounted(() => {
  fetchBookmarks()
})
</script>