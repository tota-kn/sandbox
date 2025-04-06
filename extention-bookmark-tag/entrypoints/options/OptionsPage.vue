<template>
  <div class="max-w-4xl mx-auto p-5 space-y-4 font-sans">
    <PageHeader>Bookmark Tag Manager</PageHeader>  

    <div>
      <SectionHeader>Tag List</SectionHeader>

      <SearchBox 
        v-model="tagSearchQuery"
        class="mb-3" 
        placeholder="Search tags..."
      />

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
    
    <div class="space-y-4">
      <SectionHeader>Bookmark List</SectionHeader>

      <SelectedBookmarkList
        v-if="selectedBookmarks.length > 0"
        :bookmarks="selectedBookmarks"
        @toggle-bookmark="toggleBookmarkSelection"
        @clear-selections="clearAllSelections"
        @add-tag="addTagToSelectedBookmarks"
        @remove-tag="removeTagFromSelectedBookmarks"
        @move-bookmarks="moveSelectedBookmarks"
      />

      <SearchBox 
        v-model="bookmarkSearchQuery"
        placeholder="Search by title or URL..."
      />

      <LoadingIndicator v-if="loading" />

      <EmptyStateMessage
        v-else-if="filteredBookmarks.length === 0"
        message="No bookmarks to display"
      />
      
      <FolderView 
        :bookmarks="filteredBookmarks" 
        @update-title="updateBookmarkTitle"
        @toggle-select="toggleBookmarkSelection"
        @toggle-folder-expanded="toggleFolderExpanded"
        @toggle-folder-selection="toggleFolderSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TagBadge from '../../components/TagBadge.vue'
import SearchBox from '../../components/SearchBox.vue'
import FolderView from '../../components/FolderView.vue'
import PageHeader from '../../components/PageHeader.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import LoadingIndicator from '../../components/LoadingIndicator.vue'
import EmptyStateMessage from '../../components/EmptyStateMessage.vue'
import SelectedBookmarkList from '../../components/SelectedBookmarkList.vue'
import { extractTags } from '../../utils/tagUtils'
import { flattenBookmarks, updateBookmark as updateBookmarkUtil, ExtendedBookmark, getAllBookmarksInFolder } from '../../utils/bookmarkUtils'

/** ブックマークの配列を管理する状態 */
const bookmarks = ref<ExtendedBookmark[]>([])
/** データ読込中かどうかのフラグ */
const loading = ref(true)
/** ブックマーク検索のクエリ文字列 */
const bookmarkSearchQuery = ref('')
/** タグ検索のクエリ文字列 */
const tagSearchQuery = ref('')
/** 選択されているタグのリスト */
const selectedTags = ref<string[]>([])

/**
 * Chrome拡張のAPIを使用してブックマークを取得する
 * @returns {Promise<void>}
 */
const fetchBookmarks = async (): Promise<void> => {
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

/**
 * タグの選択状態を切り替える
 * @param {string} tag タグ名
 * @returns {void}
 */
const toggleTag = (tag: string): void => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

/**
 * フォルダの展開状態を切り替える
 * @param {ExtendedBookmark} folder 対象フォルダ
 * @returns {void}
 */
const toggleFolderExpanded = (folder: ExtendedBookmark): void => {
  folder.expanded = !folder.expanded
}

/**
 * フォルダ内のすべてのブックマークの選択状態を切り替える
 * @param {ExtendedBookmark} folder 対象フォルダ
 * @returns {Promise<void>}
 */
const toggleFolderSelection = async (folder: ExtendedBookmark): Promise<void> => {
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

/**
 * タグ名を編集する
 * @param {string} oldTag 古いタグ名
 * @param {string} newTag 新しいタグ名
 * @returns {Promise<void>}
 */
const handleTagEdit = async (oldTag: string, newTag: string): Promise<void> => {
  try {
    loading.value = true
    
    // 該当タグを含むブックマークを特定
    const bookmarksToUpdate = bookmarks.value.filter(bookmark => 
      extractTags(bookmark.title || '').includes(oldTag)
    )
    
    // 各ブックマークのタグを更新
    for (const bookmark of bookmarksToUpdate) {
      const updatedTitle = bookmark.title?.replace(`${oldTag}`, `${newTag}`) || ''
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

/** 全てのブックマークからユニークなタグを抽出 */
const uniqueTags = computed(() => {
  const allTags = bookmarks.value
    .filter(bookmark => !bookmark.isFolder)
    .flatMap(bookmark => extractTags(bookmark.title || ''))
  return [...new Set(allTags)]
})

/** 検索条件でフィルタリングしたタグリスト */
const filteredTags = computed(() => {
  if (!tagSearchQuery.value) {
    return uniqueTags.value
  }
  
  const query = tagSearchQuery.value.toLowerCase()
  return uniqueTags.value.filter(tag => 
    tag.toLowerCase().includes(query)
  )
})

/** 検索条件でフィルタリングしたブックマークリスト */
const filteredBookmarks = computed(() => {
  let filtered = bookmarks.value
  
  // 検索クエリでフィルタリング
  if (bookmarkSearchQuery.value) {
    const query = bookmarkSearchQuery.value.toLowerCase()
    filtered = filtered.filter(bookmark => {
      // フォルダはそのまま表示
      if (bookmark.isFolder) return true
      
      return (bookmark.title?.toLowerCase().includes(query) || 
              bookmark.url?.toLowerCase().includes(query)) ?? false
    })
  }
  
  // タグでフィルタリング (常にOR検索)
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(bookmark => {
      // フォルダはそのまま表示
      if (bookmark.isFolder) return true
      
      const bookmarkTags = extractTags(bookmark.title || '')
      // 選択したタグのうち少なくとも1つが含まれているものをフィルタリング
      return selectedTags.value.some(tag => bookmarkTags.includes(tag))
    })
  }
  
  return filtered
})

/**
 * ブックマークのタイトルを更新する
 * @param {string} bookmarkId 更新対象のブックマークID
 * @param {string} newTitle 新しいタイトル
 * @returns {Promise<void>}
 */
const updateBookmarkTitle = async (bookmarkId: string, newTitle: string): Promise<void> => {
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

/** 選択されたブックマークのリストを計算する */
const selectedBookmarks = computed(() => {
  return bookmarks.value.filter(bookmark => !bookmark.isFolder && bookmark.selected)
})

/**
 * 全ての選択をクリアする
 * @returns {void}
 */
const clearAllSelections = (): void => {
  bookmarks.value.forEach(bookmark => {
    bookmark.selected = false
  })
}

// コンポーネントのマウント時にブックマークを取得
onMounted(() => {
  fetchBookmarks()
})

/**
 * ブックマークの選択状態を切り替える
 * @param {ExtendedBookmark} bookmark 対象のブックマーク
 * @returns {void}
 */
const toggleBookmarkSelection = (bookmark: ExtendedBookmark): void => {
  bookmark.selected = !bookmark.selected
}

/**
 * 選択中のすべてのブックマークに指定したタグを追加する
 * @param {string} tag 追加するタグ名（@なし）
 * @returns {Promise<void>}
 */
const addTagToSelectedBookmarks = async (tag: string): Promise<void> => {
  if (!tag || selectedBookmarks.value.length === 0) return;

  try {
    loading.value = true;
    // タグ形式に整形（@がない場合は追加）
    const formattedTag = tag.startsWith('@') ? tag : `@${tag}`;
    
    // 選択中のすべてのブックマークにタグを追加
    for (const bookmark of selectedBookmarks.value) {
      const bookmarkTags = extractTags(bookmark.title || '');
      
      // タグがすでに存在する場合はスキップ
      if (bookmarkTags.includes(tag)) continue;
      
      // タイトルの末尾にスペースとタグを追加
      const newTitle = (bookmark.title || '').trim() + ` ${formattedTag}`;
      
      // bookmarkUtils.tsの関数を使用してブックマークを更新
      await updateBookmarkUtil(bookmark.id, newTitle);
      bookmark.title = newTitle; // ローカルデータも更新
    }
    
    loading.value = false;
  } catch (error) {
    console.error('タグの一括追加に失敗しました:', error);
    loading.value = false;
  }
};

/**
 * 選択中のすべてのブックマークから指定したタグを削除する
 * @param {string} tag 削除するタグ名（@なし）
 * @returns {Promise<void>}
 */
const removeTagFromSelectedBookmarks = async (tag: string): Promise<void> => {
  if (!tag || selectedBookmarks.value.length === 0) return;
  
  try {
    loading.value = true;
    // タグ形式に整形（@がない場合は追加）
    const formattedTag = tag.startsWith('@') ? tag : `@${tag}`;
    
    // 選択中のすべてのブックマークからタグを削除
    for (const bookmark of selectedBookmarks.value) {
      const currentTitle = bookmark.title || '';
      
      // タグを削除（正規表現を使用して "@タグ名" を削除し、余分なスペースを整理）
      const newTitle = currentTitle
        .replace(new RegExp(`\\s*${formattedTag}\\s*`), ' ')
        .trim();
      
      // bookmarkUtils.tsの関数を使用してブックマークを更新
      await updateBookmarkUtil(bookmark.id, newTitle);
      bookmark.title =新しいタイトル; // ローカルデータも更新
    }
    
    // もし削除したタグが選択中のタグに含まれていれば、それも削除
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag);
    }
    
    loading.value = false;
  } catch (error) {
    console.error('タグの一括削除に失敗しました:', error);
    loading.value = false;
  }
};

/**
 * 選択したブックマークを指定フォルダに移動する
 * @param {string} folderId 移動先フォルダのID
 * @returns {Promise<void>}
 */
const moveSelectedBookmarks = async (folderId: string): Promise<void> => {
  if (!folderId || selectedBookmarks.value.length === 0) return;
  
  try {
    loading.value = true;
    
    // 選択したブックマークを移動
    for (const bookmark of selectedBookmarks.value) {
      try {
        // Chrome拡張のブックマークAPIを使用して移動
        await chrome.bookmarks.move(bookmark.id, { parentId: folderId });
      } catch (error) {
        console.error(`ブックマークの移動に失敗しました (ID: ${bookmark.id}):`, error);
      }
    }
    
    // 移動完了後、ブックマーク一覧を再取得
    await fetchBookmarks();
    
    loading.value = false;
  } catch (error) {
    console.error('ブックマークの移動中にエラーが発生しました:', error);
    loading.value = false;
    
    // エラー通知
    alert('一部のブックマークの移動に失敗しました。詳細はコンソールを確認してください。');
  }
};
</script>