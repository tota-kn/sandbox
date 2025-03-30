import { extractTags } from './tagUtils';
import { getCurrentTab, getTabUrl, getTabTitle } from './tabUtils';

/**
 * ブックマークの拡張型定義
 * Chrome API のブックマークツリーノードに追加プロパティを持たせた拡張型
 */
export interface ExtendedBookmark extends chrome.bookmarks.BookmarkTreeNode {
    /** フォルダかどうかのフラグ */
    isFolder?: boolean 
    /** パス情報（フォルダ階層） */
    path?: string[] 
    /** 選択状態 */
    selected?: boolean 
    /** フォルダの展開状態 */
    expanded?: boolean 
    /** フォルダの階層の深さ */
    depth?: number 
}

/**
 * 現在のタブのブックマーク情報を取得する
 * @returns {Promise<{tab: chrome.tabs.Tab | null, bookmark: chrome.bookmarks.BookmarkTreeNode | null, url: string, title: string}>} 
 *          現在のタブ、ブックマーク情報、URL、タイトルを含むオブジェクト
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
 * @param {string} bookmarkId 更新するブックマークのID
 * @param {string} title 新しいブックマークタイトル
 * @returns {Promise<{success: boolean, message: string}>} 処理結果を含むオブジェクト
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
 * @param {string} title ブックマークのタイトル
 * @param {string} url ブックマークのURL
 * @returns {Promise<{success: boolean, message: string, bookmark?: chrome.bookmarks.BookmarkTreeNode}>} 
 *          処理結果と作成されたブックマーク情報を含むオブジェクト
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
 * @param {string} bookmarkId 削除するブックマークのID
 * @returns {Promise<{success: boolean, message: string}>} 処理結果を含むオブジェクト
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
 * @param {string} input 入力されたテキスト（タグの一部）
 * @param {string[]} currentTags 現在選択されているタグのリスト
 * @returns {Promise<string[]>} サジェストされたタグのリスト
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
 * Chrome APIからのブックマークツリーを平坦化する
 * @param {chrome.bookmarks.BookmarkTreeNode[]} bookmarkNodes ブックマークツリー
 * @param {string[]} path 現在のパス
 * @param {number} depth 現在の深さ
 * @returns {ExtendedBookmark[]} 拡張したブックマークの配列
 */
export const flattenBookmarks = (
    bookmarkNodes: chrome.bookmarks.BookmarkTreeNode[],
    path: string[] = [],
    depth: number = 0
): ExtendedBookmark[] => {
    const result: ExtendedBookmark[] = [];

    for (const node of bookmarkNodes) {
        const isFolder = !node.url;
        const currentPath = [...path];

        // フォルダの場合はパスに追加
        if (isFolder && node.title) {
            currentPath.push(node.title);
        }

        const bookmark: ExtendedBookmark = {
            ...node,
            isFolder,
            path: currentPath,
            expanded: true, // デフォルトで展開表示
            depth
        };

        result.push(bookmark);

        // 子ノードがあれば再帰的に処理
        if (node.children && node.children.length > 0) {
            const children = flattenBookmarks(node.children, currentPath, depth + 1);
            result.push(...children);
        }
    }

    return result;
};

/**
 * ディレクトリ内のすべてのブックマークを再帰的に取得
 * @param {ExtendedBookmark} folder フォルダブックマーク
 * @param {ExtendedBookmark[]} allBookmarks すべてのブックマーク配列（再帰呼び出し用）
 * @returns {ExtendedBookmark[]} フォルダ内のすべてのブックマーク（サブフォルダ含む）
 */
export const getAllBookmarksInFolder = (
    folder: ExtendedBookmark,
    allBookmarks: ExtendedBookmark[] = []
): ExtendedBookmark[] => {
    // すべてのブックマークから、このフォルダを親に持つものを抽出
    const children = allBookmarks.length > 0
        ? allBookmarks.filter(b => b.parentId === folder.id)
        : folder.children || [];

    let result: ExtendedBookmark[] = [];

    for (const child of children) {
        if (child.isFolder) {
            // フォルダの場合は自身を追加し、再帰的に子要素も取得
            result.push(child);
            result = [...result, ...getAllBookmarksInFolder(child, allBookmarks)];
        } else {
            // ブックマークの場合はそのまま追加
            result.push(child);
        }
    }

    return result;
};