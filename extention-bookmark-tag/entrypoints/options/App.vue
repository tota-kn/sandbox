<template>
  <div class="options-container">
    <h1>ブックマークタグ管理</h1>
    
    <div class="filter-section">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="タグまたはブックマーク名で検索" 
        class="search-input"
      />
    </div>
    
    <div class="tags-section">
      <h2>タグ一覧</h2>
      <div class="tag-list">
        <span 
          v-for="tag in uniqueTags" 
          :key="tag"
          @click="filterByTag(tag)" 
          :class="['tag-badge', selectedTag === tag ? 'selected' : '']"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    
    <div class="bookmarks-section">
      <h2>ブックマーク一覧</h2>
      <div v-if="loading">読み込み中...</div>
      <div v-else-if="filteredBookmarks.length === 0" class="no-bookmarks">
        表示するブックマークがありません
      </div>
      <ul v-else class="bookmark-list">
        <li v-for="bookmark in filteredBookmarks" :key="bookmark.id" class="bookmark-item">
          <div class="bookmark-content">
            <a :href="bookmark.url" target="_blank" class="bookmark-title">{{ bookmark.title }}</a>
            <div class="bookmark-tags">
              <span 
                v-for="tag in extractTags(bookmark.title)" 
                :key="tag" 
                class="bookmark-tag"
                @click="filterByTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
const selectedTag = ref('')

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
  const tagRegex = /@(\w+)/g
  const matches = [...title.matchAll(tagRegex)]
  return matches.map(match => match[0])
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
  if (selectedTag.value) {
    filtered = filtered.filter(bookmark => 
      extractTags(bookmark.title).includes(selectedTag.value)
    )
  }
  
  return filtered
})

// 全てのユニークなタグを抽出
const uniqueTags = computed(() => {
  const allTags = bookmarks.value.flatMap(bookmark => extractTags(bookmark.title))
  return [...new Set(allTags)]
})

// タグでフィルタリング
const filterByTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = '' // 同じタグをクリックした場合はクリア
  } else {
    selectedTag.value = tag
  }
}

// コンポーネントのマウント時にブックマークを取得
onMounted(() => {
  fetchBookmarks()
})
</script>

<style scoped>
.options-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.filter-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tags-section {
  margin-bottom: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  background-color: #f0f0f0;
  color: #333;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag-badge:hover {
  background-color: #e0e0e0;
}

.tag-badge.selected {
  background-color: #4a90e2;
  color: white;
}

.bookmarks-section {
  margin-top: 20px;
}

.bookmark-list {
  list-style: none;
  padding: 0;
}

.bookmark-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.bookmark-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bookmark-title {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
}

.bookmark-title:hover {
  text-decoration: underline;
}

.bookmark-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.bookmark-tag {
  background-color: #e8f0fe;
  color: #1a73e8;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
}

.bookmark-tag:hover {
  background-color: #d2e3fc;
}

.no-bookmarks {
  padding: 20px 0;
  color: #666;
  font-style: italic;
}
</style>