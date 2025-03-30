import { extractTags } from './tagUtils';
import { getCurrentTab, getTabUrl, getTabTitle } from './tabUtils';

/**
 * 現在のタブのブックマーク情報を取得する
 */
export const getCurrentTabBookmark = async (): Promise<{
    tab: chrome.tabs.Tab | null;
    bookmark: chrome.bookmarks.BookmarkTreeNode | null;
    url: string;
    title: string;
}> => {
    try {
        const currentTab = await getCurrentTab();
        const url = getTabUrl(currentTab);

        // このURLがブックマークされているか確認
        const bookmarks = url ? await chrome.bookmarks.search({ url }) : [];
        const currentBookmark = bookmarks && bookmarks.length > 0 ? bookmarks[0] : null;

        return {
            tab: currentTab,
            bookmark: currentBookmark,
            url,
            title: currentBookmark?.title || getTabTitle(currentTab) || '',
        };
    } catch (error) {
        console.error('タブ情報の取得に失敗しました:', error);
        return {
            tab: null,
            bookmark: null,
            url: '',
            title: '',
        };
    }
};

/**
 * ブックマークを更新する
 */
export const updateBookmark = async (
    bookmarkId: string,
    title: string
): Promise<{ success: boolean; message: string }> => {
    try {
        await chrome.bookmarks.update(bookmarkId, { title });
        return { success: true, message: 'Updated' };
    } catch (error) {
        console.error('ブックマークの更新に失敗しました:', error);
        return { success: false, message: 'Error occurred' };
    }
};

/**
 * 新しいブックマークを作成する
 */
export const createBookmark = async (
    title: string,
    url: string
): Promise<{ success: boolean; message: string; bookmark?: chrome.bookmarks.BookmarkTreeNode }> => {
    try {
        // デフォルトのブックマークフォルダを使用
        const bookmarkTree = await chrome.bookmarks.getTree();
        const defaultFolder = bookmarkTree[0].children?.[1]?.id; // 通常はブックマークバー

        if (!defaultFolder) {
            return { success: false, message: 'Default folder not found' };
        }

        const newBookmark = await chrome.bookmarks.create({
            parentId: defaultFolder,
            title,
            url
        });

        return {
            success: true,
            message: 'Bookmarked',
            bookmark: newBookmark
        };
    } catch (error) {
        console.error('ブックマークの作成に失敗しました:', error);
        return { success: false, message: 'Error occurred' };
    }
};

/**
 * ブックマークを削除する
 */
export const deleteBookmark = async (
    bookmarkId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        await chrome.bookmarks.remove(bookmarkId);
        return { success: true, message: 'Removed' };
    } catch (error) {
        console.error('ブックマークの削除に失敗しました:', error);
        return { success: false, message: 'Error occurred' };
    }
};

/**
 * 既存タグからサジェストを生成する
 */
export const generateTagSuggestions = async (
    input: string,
    currentTags: string[]
): Promise<string[]> => {
    if (!input) {
        return [];
    }

    try {
        const query = input.toLowerCase().replace(/^@/, '');
        const allBookmarks = await chrome.bookmarks.search({});
        const tagSet = new Set<string>();

        allBookmarks.forEach(bookmark => {
            // tagUtils.tsの関数を使用
            const tags = extractTags(bookmark.title || '');
            tags.forEach(tag => {
                const tagText = tag.slice(1).toLowerCase();
                if (tagText.includes(query)) {
                    tagSet.add(tag);
                }
            });
        });

        // 現在すでに選択されているタグは除外
        return Array.from(tagSet).filter(tag => !currentTags.includes(tag));
    } catch (error) {
        console.error('タグサジェストの生成に失敗しました:', error);
        return [];
    }
};

/**
 * ブックマークツリーを平坦化する
 */
export const flattenBookmarks = (bookmarkItems: chrome.bookmarks.BookmarkTreeNode[]): chrome.bookmarks.BookmarkTreeNode[] => {
    let result: chrome.bookmarks.BookmarkTreeNode[] = [];

    for (const item of bookmarkItems) {
        if (item.url) {
            result.push(item);
        }

        if (item.children) {
            result = result.concat(flattenBookmarks(item.children));
        }
    }

    return result;
};