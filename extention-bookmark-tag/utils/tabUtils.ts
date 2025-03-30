/**
 * タブ操作に関するユーティリティ関数
 */

/**
 * 現在のアクティブなタブを取得する
 * @returns {Promise<chrome.tabs.Tab | null>} 現在のタブ情報、取得できない場合はnull
 */
export const getCurrentTab = async (): Promise<chrome.tabs.Tab | null> => {
    try {
        const queryOptions = { active: true, currentWindow: true };
        const [tab] = await chrome.tabs.query(queryOptions);
        return tab || null;
    } catch (error) {
        console.error('現在のタブの取得に失敗しました:', error);
        return null;
    }
};

/**
 * タブからURLを取得する
 * @param {chrome.tabs.Tab | null} tab タブ情報
 * @returns {string} タブのURL、取得できない場合は空文字列
 */
export const getTabUrl = (tab: chrome.tabs.Tab | null): string => {
    return tab?.url || '';
};

/**
 * タブからタイトルを取得する
 * @param {chrome.tabs.Tab | null} tab タブ情報
 * @returns {string} タブのタイトル、取得できない場合は空文字列
 */
export const getTabTitle = (tab: chrome.tabs.Tab | null): string => {
    return tab?.title || '';
};

/**
 * 表示中のタブのブックマーク状態を確認する
 * @returns {Promise<boolean>} ブックマーク済みならtrue
 */
export const isCurrentTabBookmarked = async (): Promise<boolean> => {
    try {
        const tab = await getCurrentTab();
        const url = getTabUrl(tab);

        if (!url) {
            return false;
        }

        const results = await chrome.bookmarks.search({ url });
        return results && results.length > 0;
    } catch (error) {
        console.error('ブックマーク状態の確認に失敗しました:', error);
        return false;
    }
};