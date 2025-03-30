<template>
  <li class="py-3 border-b border-gray-100">
    <div class="flex items-start">
      <!-- ブックマークタイトルとタグを並べる親コンテナ -->
      <div class="flex flex-wrap items-center gap-1">
        <!-- ブックマークタイトル (タグを除去して表示) -->
        <a :href="bookmark.url" target="_blank" class="text-blue-600 font-medium hover:underline mr-1">{{ displayTitle }}</a>
        
        <!-- タグ一覧 -->
        <TagBadge 
          v-for="tag in bookmarkTags" 
          :key="tag"
          :tag="tag"
          :selected="false"
          class="mr-1"
        >
          <span class="cursor-pointer ml-1 font-bold text-gray-500 hover:text-red-600" @click.stop="removeTag(tag)">×</span>
        </TagBadge>
        
        <!-- タグ追加ボタン -->
        <div class="inline-flex items-center">
          <input 
            v-if="isEditing" 
            v-model="newTag" 
            @keyup.enter="addTag" 
            placeholder="新しいタグ" 
            class="border border-gray-300 rounded-full text-xs p-1 px-2 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500" 
            ref="tagInput"
            @blur="isEditing = false"
          />
          <button 
            v-else 
            @click="startTagEdit" 
            class="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-xs"
          >+</button>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import TagBadge from './TagBadge.vue'

interface Bookmark {
  id: string
  title: string
  url?: string
}

const props = defineProps<{
  bookmark: Bookmark
}>()

const emit = defineEmits<{
  (e: 'updateTitle', bookmarkId: string, newTitle: string): void
}>()

const isEditing = ref(false)
const newTag = ref('')
const tagInput = ref<HTMLInputElement | null>(null)

// タイトルからタグを抽出する関数（@タグ形式）
const extractTags = (title: string): string[] => {
  const tagRegex = /(?:^|\s)(@[^\s]+)/g
  const matches = [...title.matchAll(tagRegex)]
  return matches.map(match => match[1])
}

// ブックマークのタグ一覧を計算
const bookmarkTags = computed(() => {
  return extractTags(props.bookmark.title)
})

// タグを除去したタイトルを表示用に計算
const displayTitle = computed(() => {
  // すべてのタグ (@xxx 形式) を削除し、余分な空白を整理
  return props.bookmark.title.replace(/\s?@[^\s]+\s?/g, ' ').trim()
})

// タグ編集を開始する
const startTagEdit = async () => {
  isEditing.value = true
  newTag.value = ''
  await nextTick()
  tagInput.value?.focus()
}

// タグを追加する
const addTag = async () => {
  if (!newTag.value.trim()) {
    isEditing.value = false
    return
  }
  
  const formattedTag = newTag.value.trim().startsWith('@') 
    ? newTag.value.trim() 
    : `@${newTag.value.trim()}`
    
  if (!bookmarkTags.value.includes(formattedTag)) {
    // タグが存在しない場合のみ追加する
    const updatedTitle = `${props.bookmark.title} ${formattedTag}`
    emit('updateTitle', props.bookmark.id, updatedTitle)
  }
  
  newTag.value = ''
  isEditing.value = false
}

// タグを削除する
const removeTag = async (tagToRemove: string) => {
  // タイトルからタグを削除
  const updatedTitle = props.bookmark.title.replace(tagToRemove, '').replace(/\s+/g, ' ').trim()
  emit('updateTitle', props.bookmark.id, updatedTitle)
}
</script>