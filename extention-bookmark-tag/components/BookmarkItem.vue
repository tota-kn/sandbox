<template>
  <li class="border-b last:border-b-0 py-3">
    <div class="flex items-start">
      <!-- 選択チェックボックス -->
      <div v-if="selectable" class="mr-3 mt-1">
        <input 
          type="checkbox" 
          :checked="selected" 
          @change="$emit('toggle-select')"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- 編集モード -->
        <div v-if="isEditing" class="flex items-center gap-2 mb-1">
          <input 
            v-model="editTitle" 
            class="flex-1 px-2 py-1 border rounded text-sm"
            @keyup.enter="saveEdit"
            ref="titleInput"
          />
          <button 
            @click="saveEdit" 
            class="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            保存
          </button>
          <button 
            @click="cancelEdit" 
            class="px-2 py-1 text-xs bg-gray-300 rounded"
          >
            キャンセル
          </button>
        </div>
        
        <!-- 表示モード -->
        <div v-else class="group flex items-start">
          <div class="flex-1">
            <div class="flex items-center">
              <h3 class="text-base font-medium mb-1 mr-2">
                {{ displayTitle }}
              </h3>
              <button 
                @click="startEdit" 
                class="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                編集
              </button>
            </div>
            
            <!-- タグ -->
            <div class="flex flex-wrap gap-1">
              <TagBadge
                v-for="tag in bookmarkTags"
                :key="tag"
                :tag="tag"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import TagBadge from './TagBadge.vue'
import { extractTags } from '../utils/tagUtils'

interface BookmarkProps {
  bookmark: {
    id: string
    title: string
    url?: string
  }
  selectable?: boolean  // 選択可能かどうか
  selected?: boolean   // 選択状態
}

const props = withDefaults(defineProps<BookmarkProps>(), {
  selectable: false,
  selected: false
})

// 親コンポーネントに通知するイベント
const emit = defineEmits(['update-title', 'toggle-select'])

// 編集関連の状態
const isEditing = ref(false)
const editTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

// タイトルからタグを除外した表示用タイトル
const displayTitle = computed(() => {
  // タグを除外したタイトルを返す処理
  const title = props.bookmark.title
  return title.replace(/@\S+/g, '').trim()
})

// ブックマークに含まれるタグの配列
const bookmarkTags = computed(() => {
  return extractTags(props.bookmark.title)
})

// 編集モードの開始
const startEdit = () => {
  editTitle.value = props.bookmark.title
  isEditing.value = true
  
  // 入力フォームにフォーカス
  nextTick(() => {
    titleInput.value?.focus()
  })
}

// 編集のキャンセル
const cancelEdit = () => {
  isEditing.value = false
  editTitle.value = ''
}

// 編集内容の保存
const saveEdit = () => {
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.bookmark.title) {
    emit('update-title', props.bookmark.id, newTitle)
  }
  isEditing.value = false
}
</script>