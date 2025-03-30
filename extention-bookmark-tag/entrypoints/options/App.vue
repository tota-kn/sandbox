<template>
  <div class="max-w-3xl mx-auto p-5 font-sans">
    <h1 class="text-2xl font-bold text-gray-800 pb-3 mb-4 border-b-2 border-gray-100">Bookmark Tag Manager</h1>
    
    <div class="mb-6">
      <div class="flex items-center mb-3">
        <h2 class="text-xl font-semibold mr-4">Tag List</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Filter:</span>
          <label class="inline-flex items-center gap-1 cursor-pointer">
            <input type="radio" v-model="searchMode" value="or" class="form-radio text-blue-600" />
            <span class="text-sm">OR</span>
          </label>
          <label class="inline-flex items-center gap-1 cursor-pointer ml-2">
            <input type="radio" v-model="searchMode" value="and" class="form-radio text-blue-600" />
            <span class="text-sm">AND</span>
          </label>
        </div>
      </div>

      <!-- タグ検索ボックス -->
      <div class="mb-3">
        <SearchBox 
          v-model="tagSearchQuery" 
          placeholder="Search tags..."
        />
      </div>

      <!-- タグ一覧 -->
      <div class="flex flex-wrap gap-2">
        <TagBadge 
          v-for="tag in filteredTags" 
          :key="tag"
          :tag="tag"
          :selected="selectedTags.includes(tag)"
          :show-edit-button="true"
          @toggle="toggleTag(tag)"
          @edit="handleTagEdit"
        />
      </div>
    </div>
    
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-3">Bookmark List</h2>

      <!-- ブックマーク検索ボックス -->
      <div class="mb-3">
        <SearchBox 
          v-model="bookmarkSearchQuery" 
          placeholder="Search by title or URL..."
        />
      </div>

      <div v-if="loading" class="py-4">Loading...</div>
      <div v-else-if="filteredBookmarks.length === 0" class="py-5 text-gray-500 italic">
        No bookmarks to display
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
import SearchBox from '../../components/SearchBox.vue'
import { extractTags } from '../../utils/tagUtils'

// ブックマークの型定義
interface Bookmark {
  id: string
  title: string
  url?: string
  children?: Bookmark[]
}

const bookmarks = ref<Bookmark[]>([])
const loading = ref(true)
const bookmarkSearchQuery = ref('')
const tagSearchQuery = ref('')
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

// タグを切り替える
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// タグ名の編集処理
const handleTagEdit = async (oldTag: string, newTag: string) => {
  try {
    loading.value = true
    
    // 該当タグを含むブックマークを特定
    const bookmarksToUpdate = bookmarks.value.filter(bookmark => 
      extractTags(bookmark.title).includes(oldTag)
    )
    
    // 各ブックマークのタグを更新
    for (const bookmark of bookmarksToUpdate) {
      const updatedTitle = bookmark.title.replace(oldTag, newTag)
      await chrome.bookmarks.update(bookmark.id, { title: updatedTitle })
      bookmark.title = updatedTitle // ローカルデータも更新
    }
    
    // 選択中のタグがあれば、それも更新
    if (selectedTags.value.includes(oldTag)) {
      selectedTags.value = selectedTags.value.map(t => 
        t === oldTag ? newTag : t
      )
    }
    
    // ブックマーク一覧を再取得せずに済むように、ここで処理完了を明示
    loading.value = false
  } catch (error) {
    console.error('タグの更新に失敗しました:', error)
    loading.value = false
  }
}

// 全てのユニークなタグを抽出
const uniqueTags = computed(() => {
  const allTags = bookmarks.value.flatMap(bookmark => extractTags(bookmark.title))
  return [...new Set(allTags)]
})

// タグ検索でフィルタリングしたタグリスト
const filteredTags = computed(() => {
  if (!tagSearchQuery.value) {
    return uniqueTags.value
  }
  
  const query = tagSearchQuery.value.toLowerCase()
  return uniqueTags.value.filter(tag => 
    tag.toLowerCase().includes(query)
  )
})

// フィルタリングされたブックマーク
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value
  
  // 検索クエリでフィルタリング
  if (bookmarkSearchQuery.value) {
    const query = bookmarkSearchQuery.value.toLowerCase()
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