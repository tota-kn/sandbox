<template>
  <div
    v-if="bookmarks.length > 0"
    class="bg-gray-50 rounded-lg p-3 border border-gray-200"
  >
    <div
      class="flex justify-between items-center"
    >
      <div
        class="text-sm text-gray-500 flex items-center"
        @click="toggleExpanded"
      >
        <IconButton class="size-4 mr-2">
          <ChevronDownIcon v-if="expanded" />
          <ChevronRightIcon v-else />
        </IconButton>
        <span>{{ bookmarks.length }} bookmarks selected</span>
      </div>
      <div class="flex space-x-2">
        <BaseButton 
          variant="primary"
          @click.stop="toggleAddTagForm"
        >
          Add tag
        </BaseButton>
        <BaseButton 
          variant="destructive"
          @click.stop="toggleRemoveTagForm"
        >
          Remove tag
        </BaseButton>
        <BaseButton 
          variant="secondary"
          @click.stop="toggleFolderMoveForm"
        >
          Move
        </BaseButton>
        <BaseButton 
          variant="link"
          @click.stop="clearAllSelections"
        >
          Clear selections
        </BaseButton>
      </div>
    </div>
    
    <!-- タグ追加フォーム (インライン) -->
    <div 
      v-if="showAddTagForm" 
      class="mt-2 p-2 bg-white rounded border border-gray-200"
    >
      <div class="flex items-center">
        <input 
          ref="addTagInput"
          v-model="tagInput"
          type="text"
          class="flex-grow p-1 border rounded mr-2"
          placeholder="Enter tag name (without @)"
          @keyup.enter="handleAddTag"
        >
        <BaseButton 
          variant="primary"
          size="sm"
          @click="handleAddTag"
        >
          Add
        </BaseButton>
        <BaseButton 
          variant="secondary"
          size="sm"
          class-name="ml-2"
          @click="cancelTagForm"
        >
          Cancel
        </BaseButton>
      </div>
    </div>
    
    <!-- タグ削除フォーム (インライン) -->
    <div 
      v-if="showRemoveTagForm" 
      class="mt-2 p-2 bg-white rounded border border-gray-200"
    >
      <div class="flex flex-wrap gap-2">
        <TagBadge
          v-for="tag in allTagsInSelectedBookmarks"
          :key="tag"
          :tag="tag"
        >
          <IconButton @click="handleRemoveTag(tag)">
            <XMarkIcon class="size-3" />
          </IconButton>
        </TagBadge>
      </div>
      <div class="flex justify-end">
        <BaseButton 
          variant="secondary"
          size="sm"
          @click="cancelTagForm"
        >
          Close
        </BaseButton>
      </div>
    </div>

    <!-- フォルダ移動フォーム (インライン) -->
    <div 
      v-if="showFolderMoveForm" 
      class="mt-2 p-2 bg-white rounded border border-gray-200"
    >
      <div class="mb-2">
        <div class="flex flex-col">
          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-700">移動先フォルダ</label>
            <div class="flex flex-col max-h-60 overflow-y-auto border border-gray-200 rounded p-2 mt-1">
              <!-- フォルダ選択リスト -->
              <div 
                v-if="folderList.length > 0"
                class="space-y-1"
              >
                <div 
                  v-for="folder in folderList" 
                  :key="folder.id"
                  class="flex items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
                  @click="selectFolder(folder)"
                >
                  <span
                    class="w-4 ml-2"
                    :style="`margin-left: ${folder.depth * 16}px`"
                  >
                    📁
                  </span>
                  <span class="ml-2">{{ folder.title }}</span>
                </div>
              </div>
              <div
                v-else
                class="text-center py-2 text-gray-500"
              >
                フォルダを読み込み中...
              </div>
            </div>
          </div>
          
          <!-- 新規フォルダ作成フォーム -->
          <div class="mb-2">
            <div class="flex items-center">
              <input
                v-model="newFolderName"
                type="text"
                class="flex-grow p-1 border rounded mr-2"
                placeholder="新規フォルダ名"
              >
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="!newFolderName.trim()"
                @click="createAndSelectFolder"
              >
                作成して選択
              </BaseButton>
            </div>
          </div>
          
          <!-- 選択中のフォルダ表示 -->
          <div
            v-if="selectedFolder"
            class="mb-2 p-2 bg-gray-100 rounded"
          >
            <p class="text-sm">
              選択中: <span class="font-medium">{{ selectedFolder.title }}</span>
            </p>
          </div>
          
          <div class="flex justify-end">
            <BaseButton
              variant="secondary"
              size="sm"
              class-name="mr-2"
              @click="cancelFolderMoveForm"
            >
              キャンセル
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              :disabled="!selectedFolder"
              @click="handleMoveBookmarks"
            >
              移動する
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <ul
      v-if="expanded"
      class="space-y-2 mt-2"
    >
      <li 
        v-for="bookmark in bookmarks" 
        :key="bookmark.id"
        class="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
      >
        <div class="flex items-center flex-grow">
          <input 
            type="checkbox"                                               
            :checked="bookmark.selected" 
            class="mr-2"
            @change="handleToggleBookmark(bookmark)"
          >
          <p>
            {{ bookmark.title || bookmark.url }}
          </p>
        </div>
        <div class="flex flex-wrap gap-1 ml-2">
          <TagBadge 
            v-for="tag in extractTagsFromTitle(bookmark.title || '')" 
            :key="`${bookmark.id}-${tag}`"
            :tag="tag"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ExtendedBookmark } from '../utils/bookmarkUtils'
import { extractTags } from '../utils/tagUtils'
import BaseButton from './BaseButton.vue'
import IconButton from './IconButton.vue'
import TagBadge from './TagBadge.vue'
import { ChevronRightIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/vue/24/outline'


/** コンポーネントのプロパーネントのプロパティ定義 */
const props = defineProps<{
  /** 選択されたブックマークのリスト */
  bookmarks: ExtendedBookmark[]
}>()

/** コンポーネントのイベント定義 */
const emit = defineEmits<{
  /** ブックマークの選択状態が切り替わった時に発火 */
  'toggle-bookmark': [bookmark: ExtendedBookmark]
  /** 全選択クリアボタンがクリックされた時に発火 */
  'clear-selections': []
  /** 選択されたブックマークにタグを追加 */
  'add-tag': [tag: string]
  /** 選択されたブックマークからタグを削除 */
  'remove-tag': [tag: string]
  /** 選択したブックマークを指定フォルダに移動 */
  'move-bookmarks': [folderId: string]
}>()

/** 開閉状態を管理する変数（デフォルトは閉じている） */
const expanded = ref(false)
/** タグ追加フォームの表示状態 */
const showAddTagForm = ref(false)
/** タグ削除フォームの表示状態 */
const showRemoveTagForm = ref(false)
/** フォルダ移動フォームの表示状態 */
const showFolderMoveForm = ref(false)
/** タグ入力値 */
const tagInput = ref('')
/** タグ入力フィールドへの参照 */
const addTagInput = ref<HTMLInputElement | null>(null)
/** フォルダリスト */
const folderList = ref<Array<{id: string, title: string, depth: number}>>([])
/** 選択中のフォルダ */
const selectedFolder = ref<{id: string, title: string, depth: number} | null>(null)
/** 新規フォルダ名 */
const newFolderName = ref('')

/**
 * タイトルからタグを抽出するユーティリティ関数
 * @param {string} title ブックマークのタイトル
 * @returns {string[]} タグのリスト
 */
const extractTagsFromTitle = (title: string): string[] => {
  return extractTags(title)
}

/**
 * 選択したブックマークに含まれるすべてのユニークなタグを計算
 */
const allTagsInSelectedBookmarks = computed((): string[] => {
  const allTags = props.bookmarks
    .flatMap(bookmark => extractTags(bookmark.title || ''))
  
  // 重複を削除
  return [...new Set(allTags)]
})

/**
 * ブックマークの選択状態を切り替える
 * @param {ExtendedBookmark} bookmark 対象のブックマーク
 */
const handleToggleBookmark = (bookmark: ExtendedBookmark): void => {
  emit('toggle-bookmark', bookmark)
}

/**
 * 全ての選択をクリアする
 */
const clearAllSelections = (): void => {
  emit('clear-selections')
}

/**
 * 開閉状態を切り替える
 */
const toggleExpanded = (): void => {
  expanded.value = !expanded.value
}

/**
 * タグ追加フォームの表示/非表示を切り替える
 */
const toggleAddTagForm = (): void => {
  // フォームを表示する場合、他のフォームは閉じる
  if (!showAddTagForm.value) {
    showRemoveTagForm.value = false
    showFolderMoveForm.value = false
    showAddTagForm.value = true
    expanded.value = true // リストも自動的に展開する
    // 入力フィールドにフォーカスを当てる（次のティックで実行）
    nextTick(() => {
      addTagInput.value?.focus()
    })
  } else {
    showAddTagForm.value = false
  }
  event?.stopPropagation()
}

/**
 * タグ削除フォームの表示/非表示を切り替える
 */
const toggleRemoveTagForm = (): void => {
  // フォームを表示する場合、他のフォームは閉じる
  if (!showRemoveTagForm.value) {
    showAddTagForm.value = false
    showFolderMoveForm.value = false
    showRemoveTagForm.value = true
    expanded.value = true // リストも自動的に展開する
  } else {
    showRemoveTagForm.value = false
  }
  event?.stopPropagation()
}

/**
 * フォルダ移動フォームの表示/非表示を切り替える
 */
const toggleFolderMoveForm = (): void => {
  // フォームを表示する場合、他のフォームは閉じる
  if (!showFolderMoveForm.value) {
    showAddTagForm.value = false
    showRemoveTagForm.value = false
    showFolderMoveForm.value = true
    expanded.value = true // リストも自動的に展開する
    loadFolders() // フォルダ一覧を読み込む
  } else {
    showFolderMoveForm.value = false
  }
  event?.stopPropagation()
}

/**
 * タグフォームをキャンセル・クリアする
 */
const cancelTagForm = (): void => {
  showAddTagForm.value = false
  showRemoveTagForm.value = false
  tagInput.value = ''
  event?.stopPropagation()
}

/**
 * フォルダ移動フォームをキャンセルする
 */
const cancelFolderMoveForm = (): void => {
  showFolderMoveForm.value = false
  selectedFolder.value = null
  newFolderName.value = ''
  event?.stopPropagation()
}

/**
 * 複数ブックマークへのタグ追加を実行
 */
const handleAddTag = (): void => {
  if (!tagInput.value.trim()) return

  // @マークを自動的に付与せずにタグ名をそのまま渡す
  // （親コンポーネント側で@付与するか判断）
  emit('add-tag', tagInput.value.trim())
  
  // フォームを閉じて入力をクリア
  cancelTagForm()
}

/**
 * 複数ブックマークからタグ削除を実行
 * @param {string} tag 削除するタグ
 */
const handleRemoveTag = (tag: string): void => {
  if (!tag) return
  
  emit('remove-tag', tag)
  
  // 削除後も削除フォームを表示したままにする
  // ユーザーが複数のタグを削除できるようにするため
}

/**
 * フォルダ一覧を再帰的に取得する
 * @returns {Promise<void>}
 */
const loadFolders = async (): Promise<void> => {
  try {
    // フォルダ一覧をクリア
    folderList.value = []
    
    // Chrome拡張のブックマークAPIを使用してフォルダツリーを取得
    const bookmarkTree = await chrome.bookmarks.getTree()
    
    // ツリーを平坦化してフォルダのみを抽出
    processFolders(bookmarkTree[0], 0)
    
  } catch (error) {
    console.error('フォルダの取得に失敗しました:', error)
  }
}

/**
 * ブックマークツリーを再帰的に処理してフォルダ一覧を作成する
 * @param {chrome.bookmarks.BookmarkTreeNode} node ブックマークツリーのノード
 * @param {number} depth 現在の深さ
 */
const processFolders = (node: chrome.bookmarks.BookmarkTreeNode, depth: number): void => {
  // ノードがフォルダの場合（urlがない場合はフォルダとみなす）
  if (!node.url) {
    // ルートフォルダ（id:0）は特殊なので除外
    if (node.id !== '0') {
      folderList.value.push({
        id: node.id,
        title: node.title || 'フォルダ',
        depth: depth
      })
    }
    
    // 子ノードを再帰的に処理
    if (node.children) {
      for (const child of node.children) {
        processFolders(child, depth + 1)
      }
    }
  }
}

/**
 * フォルダを選択する
 * @param {Object} folder 選択するフォルダ情報
 */
const selectFolder = (folder: {id: string, title: string, depth: number}): void => {
  selectedFolder.value = folder
}

/**
 * 新規フォルダを作成して選択する
 * @returns {Promise<void>}
 */
const createAndSelectFolder = async (): Promise<void> => {
  if (!newFolderName.value.trim()) return
  
  try {
    // Chrome拡張のブックマークAPIを使用して新規フォルダを作成
    // 親フォルダが選択されている場合はその中に作成、そうでなければルートに作成
    const parentId = selectedFolder.value?.id || '1' // デフォルトはルートフォルダ
    
    const newFolder = await chrome.bookmarks.create({
      parentId,
      title: newFolderName.value.trim(),
    })
    
    // 作成したフォルダを選択状態にする
    selectFolder({
      id: newFolder.id,
      title: newFolder.title || '新規フォルダ',
      depth: selectedFolder.value ? selectedFolder.value.depth + 1 : 0
    })
    
    // 作成後はフォルダ一覧を再読み込み
    await loadFolders()
    
    // 入力をクリア
    newFolderName.value = ''
    
  } catch (error) {
    console.error('フォルダの作成に失敗しました:', error)
    alert('フォルダの作成に失敗しました')
  }
}

/**
 * 選択したブックマークを指定フォルダに移動する
 */
const handleMoveBookmarks = (): void => {
  if (!selectedFolder.value) return
  
  // 親コンポーネントに移動イベントを発行
  emit('move-bookmarks', selectedFolder.value.id)
  
  // フォームをクリア
  cancelFolderMoveForm()
}

// コンポーネントのマウント時に初期処理
onMounted(() => {
  // 特に必要な初期化処理がなければ空でOK
})
</script>
