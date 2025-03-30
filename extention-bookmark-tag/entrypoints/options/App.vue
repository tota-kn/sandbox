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
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-semibold">Bookmark List</h2>
          <!-- 表示モード切替 -->
          <div class="flex items-center">
            <button 
              @click="toggleDisplayMode" 
              class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
              :class="{'bg-blue-100': showFolderStructure}"
            >
              <span v-if="showFolderStructure">🗂️</span>
              <span v-else>📑</span>
              {{ showFolderStructure ? 'Folder View' : 'Flat View' }}
            </button>
          </div>
        </div>
        
        <!-- バッチ編集モードボタン -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ selectedBookmarks.length }} selected</span>
          <button 
            @click="toggleBatchEditMode" 
            class="px-3 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
            :class="{'bg-red-500 hover:bg-red-600': batchEditMode}"
          >
            {{ batchEditMode ? 'Cancel Batch Edit' : 'Batch Edit Tags' }}
          </button>
          <button 
            v-if="selectedBookmarks.length > 0"
            @click="clearAllSelection" 
            class="px-3 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- バッチ編集フォーム -->
      <div v-if="batchEditMode" class="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 class="font-medium mb-2 text-blue-800">Batch Tag Edit</h3>
        
        <div class="flex flex-col gap-3">
          <!-- タグ追加 -->
          <div class="flex items-center gap-2">
            <input 
              v-model="batchTagToAdd" 
              placeholder="Tag to add..." 
              class="px-3 py-2 border rounded flex-grow"
            />
            <button 
              @click="addTagToBatch"
              :disabled="!batchTagToAdd || selectedBookmarks.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Add Tag
            </button>
          </div>
          
          <!-- タグ削除 -->
          <div class="flex items-center gap-2">
            <input 
              v-model="batchTagToRemove" 
              placeholder="Tag to remove..." 
              class="px-3 py-2 border rounded flex-grow"
            />
            <button 
              @click="removeTagFromBatch"
              :disabled="!batchTagToRemove || selectedBookmarks.length === 0"
              class="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Remove Tag
            </button>
          </div>
        </div>
      </div>

      <!-- ブックマーク検索ボックス -->
      <div class="mb-3">
        <SearchBox 
          v-model="bookmarkSearchQuery" 
          placeholder="Search by title or URL..."
        />
      </div>

      <div v-if="loading" class="py-4">Loading...</div>
      <div v-else-if="filteredBookmarks.length === 0 && !showFolderStructure" class="py-5 text-gray-500 italic">
        No bookmarks to display
      </div>
      
      <!-- フォルダ構造表示 -->
      <div v-if="showFolderStructure">
        <ul class="list-none p-0">
          <template v-for="bookmark in bookmarks" :key="bookmark.id">
            <!-- ルートフォルダのみここで表示（重複表示を防ぐ） -->
            <li v-if="bookmark.isFolder && (!bookmark.parentId || bookmark.parentId === '0' || bookmark.parentId === '1') && 
                !bookmarks.some(b => b.id === bookmark.parentId && b.isFolder)" class="mb-1">
              <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
                <button 
                  @click="toggleFolderExpanded(bookmark)" 
                  class="mr-2 w-4 h-4 flex items-center justify-center"
                >
                  <span v-if="bookmark.expanded">▼</span>
                  <span v-else>▶</span>
                </button>
                
                <!-- フォルダ選択チェックボックス -->
                <div class="mr-2">
                  <input 
                    type="checkbox" 
                    :checked="getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder)"
                    @change="toggleFolderSelection(bookmark)"
                    :indeterminate="
                      getAllBookmarksInFolder(bookmark, bookmarks).some(b => b.selected && !b.isFolder) && 
                      !getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
                    "
                    class="h-4 w-4 text-blue-600"
                  />
                </div>
                
                <span class="font-medium">
                  📁 {{ bookmark.title }}
                </span>
                <span class="ml-2 text-xs text-gray-500">
                  ({{ getAllBookmarksInFolder(bookmark, bookmarks).filter(b => !b.isFolder).length }})
                </span>
              </div>
              
              <!-- フォルダ内のブックマーク -->
              <div v-if="bookmark.expanded" class="pl-6">
                <ul class="list-none p-0">
                  <template v-for="child in bookmarks.filter(b => b.parentId === bookmark.id)" :key="child.id">
                    <!-- サブフォルダの場合 -->
                    <li v-if="child.isFolder" class="mb-1">
                      <div class="flex items-center py-2 px-1 hover:bg-gray-50 rounded">
                        <button 
                          @click="toggleFolderExpanded(child)" 
                          class="mr-2 w-4 h-4 flex items-center justify-center"
                        >
                          <span v-if="child.expanded">▼</span>
                          <span v-else>▶</span>
                        </button>
                        
                        <!-- フォルダ選択チェックボックス -->
                        <div class="mr-2">
                          <input 
                            type="checkbox" 
                            :checked="getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder)"
                            @change="toggleFolderSelection(child)"
                            :indeterminate="
                              getAllBookmarksInFolder(child, bookmarks).some(b => b.selected && !b.isFolder) && 
                              !getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).every(b => b.selected)
                            "
                            class="h-4 w-4 text-blue-600"
                          />
                        </div>
                        
                        <span class="font-medium">
                          📁 {{ child.title }}
                        </span>
                        <span class="ml-2 text-xs text-gray-500">
                          ({{ getAllBookmarksInFolder(child, bookmarks).filter(b => !b.isFolder).length }})
                        </span>
                      </div>
                      
                      <!-- サブフォルダ内のアイテム（再帰的に表示） -->
                      <div v-if="child.expanded" class="pl-6">
                        <BookmarkItem 
                          v-for="grandchild in bookmarks.filter(b => b.parentId === child.id && !b.isFolder)"
                          :key="grandchild.id"
                          :bookmark="grandchild"
                          :selectable="true"
                          :selected="grandchild.selected || false"
                          @update-title="updateBookmarkTitle"
                          @toggle-select="toggleBookmarkSelection(grandchild)"
                        />
                      </div>
                    </li>
                    
                    <!-- 通常のブックマークの場合 -->
                    <BookmarkItem 
                      v-else
                      :bookmark="child"
                      :selectable="true"
                      :selected="child.selected || false"
                      @update-title="updateBookmarkTitle"
                      @toggle-select="toggleBookmarkSelection(child)"
                    />
                  </template>
                </ul>
              </div>
            </li>
          </template>
        </ul>
      </div>
      
      <!-- フラットビュー表示 -->
      <ul v-else class="list-none p-0">
        <BookmarkItem 
          v-for="bookmark in filteredBookmarks"
          :key="bookmark.id"
          :bookmark="bookmark"
          :selectable="true"
          :selected="bookmark.selected || false"
          @update-title="updateBookmarkTitle"
          @toggle-select="toggleBookmarkSelection(bookmark)"
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
import { flattenBookmarks, updateBookmark as updateBookmarkUtil, ExtendedBookmark, getAllBookmarksInFolder } from '../../utils/bookmarkUtils'

const bookmarks = ref<ExtendedBookmark[]>([])
const loading = ref(true)
const bookmarkSearchQuery = ref('')
const tagSearchQuery = ref('')
const selectedTags = ref<string[]>([])
const searchMode = ref<'and' | 'or'>('or')
// 選択中のブックマークを管理
const selectedBookmarks = computed(() => bookmarks.value.filter(b => b.selected))
// バッチ編集モード
const batchEditMode = ref(false)
// バッチ編集用の新しいタグ
const batchTagToAdd = ref('')
const batchTagToRemove = ref('')
// ディレクトリ表示モード
const showFolderStructure = ref(true)

// ブックマークを取得する関数
const fetchBookmarks = async () => {
  try {
    // Chrome拡張のブックマークAPIを使用
    const results = await chrome.bookmarks.getTree()
    // 取得したツリー構造を平坦化して保持
    bookmarks.value = flattenBookmarks(results)
    
    // すべてのフォルダを展開状態に設定
    bookmarks.value.forEach(bookmark => {
      if (bookmark.isFolder) {
        bookmark.expanded = true
      }
    })
    
    loading.value = false
  } catch (error) {
    console.error('ブックマークの取得に失敗しました:', error)
    loading.value = false
  }
}

// タグを切り替える
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// フォルダの展開状態を切り替える
const toggleFolderExpanded = (folder: ExtendedBookmark) => {
  folder.expanded = !folder.expanded
}

// フォルダ内のすべてのブックマークの選択状態を切り替える
const toggleFolderSelection = async (folder: ExtendedBookmark) => {
  // フォルダ内のすべてのブックマークを取得
  const allFolderItems = getAllBookmarksInFolder(folder, bookmarks.value)
  
  // フォルダ内の通常のブックマーク（フォルダではないもの）だけを取得
  const bookmarksInFolder = allFolderItems.filter(b => !b.isFolder)
  
  // すべて選択済みかをチェック（一つでも未選択のものがあれば false）
  const allSelected = bookmarksInFolder.every(b => b.selected)
  
  // 全選択と全解除を切り替える
  // すべて選択されているなら解除、そうでなければ全選択
  const newState = !allSelected
  
  // フォルダ内のすべての通常ブックマークの選択状態を更新
  bookmarksInFolder.forEach(bookmark => {
    bookmark.selected = newState
  })
}

// タグ名の編集処理
const handleTagEdit = async (oldTag: string, newTag: string) => {
  try {
    loading.value = true
    
    // 該当タグを含むブックマークを特定
    const bookmarksToUpdate = bookmarks.value.filter(bookmark => 
      extractTags(bookmark.title || '').includes(oldTag)
    )
    
    // 各ブックマークのタグを更新
    for (const bookmark of bookmarksToUpdate) {
      const updatedTitle = bookmark.title?.replace(`@${oldTag}`, `@${newTag}`) || ''
      // bookmarkUtils.tsの関数を使用
      await updateBookmarkUtil(bookmark.id, updatedTitle)
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
  const allTags = bookmarks.value
    .filter(bookmark => !bookmark.isFolder)
    .flatMap(bookmark => extractTags(bookmark.title || ''))
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

// フォルダ構造表示用のブックマーク
const folderStructureBookmarks = computed(() => {
  if (!showFolderStructure.value) {
    return filteredBookmarks.value
  }
  
  // フォルダはそのまま表示
  return bookmarks.value.filter(bookmark => {
    // フォルダはそのまま表示
    if (bookmark.isFolder) return true
    
    // 通常のブックマークはフィルタリング条件に従う
    let include = true
    
    // 検索クエリでフィルタリング
    if (bookmarkSearchQuery.value) {
      const query = bookmarkSearchQuery.value.toLowerCase()
      include = (bookmark.title?.toLowerCase().includes(query) || 
                bookmark.url?.toLowerCase().includes(query)) ?? false
    }
    
    // タグでフィルタリング
    if (include && selectedTags.value.length > 0) {
      const bookmarkTags = extractTags(bookmark.title || '')
      
      if (searchMode.value === 'or') {
        // OR検索: 選択したタグのうち少なくとも1つが含まれている
        include = selectedTags.value.some(tag => bookmarkTags.includes(tag))
      } else {
        // AND検索: 選択したタグすべてが含まれている
        include = selectedTags.value.every(tag => bookmarkTags.includes(tag))
      }
    }
    
    return include
  })
})

// フィルタリングされたブックマーク
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value.filter(bookmark => !bookmark.isFolder)
  
  // 検索クエリでフィルタリング
  if (bookmarkSearchQuery.value) {
    const query = bookmarkSearchQuery.value.toLowerCase()
    filtered = filtered.filter(bookmark => 
      (bookmark.title?.toLowerCase().includes(query) || 
       bookmark.url?.toLowerCase().includes(query)) ?? false
    )
  }
  
  // タグでフィルタリング
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(bookmark => {
      const bookmarkTags = extractTags(bookmark.title || '')
      
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
    // bookmarkUtils.tsの関数を使用
    await updateBookmarkUtil(bookmarkId, newTitle)
    
    // ローカルのブックマークデータを更新
    const bookmark = bookmarks.value.find(b => b.id === bookmarkId)
    if (bookmark) {
      bookmark.title = newTitle
    }
    
    // 選択中のタグが削除された場合、フィルターをクリア
    const currentTags = extractTags(newTitle)
    selectedTags.value = selectedTags.value.filter(tag => currentTags.includes(tag) || 
      bookmarks.value.some(b => b.id !== bookmarkId && extractTags(b.title || '').includes(tag)))
  } catch (error) {
    console.error('ブックマークの更新に失敗しました:', error)
  }
}

// コンポーネントのマウント時にブックマークを取得
onMounted(() => {
  fetchBookmarks()
})

// ブックマークの選択状態を切り替える
const toggleBookmarkSelection = (bookmark: ExtendedBookmark) => {
  bookmark.selected = !bookmark.selected
}

// すべてのブックマークの選択をクリア
const clearAllSelection = () => {
  bookmarks.value.forEach(bookmark => {
    bookmark.selected = false
  })
}

// バッチ編集モードの切り替え
const toggleBatchEditMode = () => {
  batchEditMode.value = !batchEditMode.value
  if (!batchEditMode.value) {
    // バッチ編集モードを終了したら入力をクリア
    batchTagToAdd.value = ''
    batchTagToRemove.value = ''
  }
}

// 選択されたブックマークに一括でタグを追加
const addTagToBatch = async () => {
  if (!batchTagToAdd.value || selectedBookmarks.value.length === 0) return

  try {
    loading.value = true
    const tag = batchTagToAdd.value.startsWith('@') ? batchTagToAdd.value : `@${batchTagToAdd.value}`

    for (const bookmark of selectedBookmarks.value) {
      if (!bookmark.isFolder && !extractTags(bookmark.title || '').includes(tag.substring(1))) {
        const updatedTitle = `${bookmark.title} ${tag}`
        await updateBookmarkUtil(bookmark.id, updatedTitle)
        bookmark.title = updatedTitle
      }
    }

    batchTagToAdd.value = ''
    loading.value = false
  } catch (error) {
    console.error('タグの一括追加に失敗しました:', error)
    loading.value = false
  }
}

// 選択されたブックマークから一括でタグを削除
const removeTagFromBatch = async () => {
  if (!batchTagToRemove.value || selectedBookmarks.value.length === 0) return

  try {
    loading.value = true
    const tag = batchTagToRemove.value.startsWith('@') ? batchTagToRemove.value : `@${batchTagToRemove.value}`

    for (const bookmark of selectedBookmarks.value) {
      if (!bookmark.isFolder && extractTags(bookmark.title || '').includes(tag.substring(1))) {
        const updatedTitle = (bookmark.title || '').replace(tag, '').replace(/\s+/g, ' ').trim()
        await updateBookmarkUtil(bookmark.id, updatedTitle)
        bookmark.title = updatedTitle
      }
    }

    batchTagToRemove.value = ''
    loading.value = false
  } catch (error) {
    console.error('タグの一括削除に失敗しました:', error)
    loading.value = false
  }
}

// 表示モードの切り替え
const toggleDisplayMode = () => {
  showFolderStructure.value = !showFolderStructure.value
}
</script>