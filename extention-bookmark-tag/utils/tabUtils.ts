/**
 * タブ操作に関するユーティリティ関数
 */

/**
 * 現在アクティブなタブ情報を取得する
 */
export const getCurrentTab = async (): Promise<chrome.tabs.Tab | null> => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0] || null;
    } catch (error) {
        console.error('アクティブなタブの取得に失敗しました:', error);
        return null;
    }
};

/**
 * 指定されたURLをタブで開く
 */
export const openInNewTab = async (url: string): Promise<chrome.tabs.Tab | null> => {
    try {
        const tab = await chrome.tabs.create({ url });
        return tab;
    } catch (error) {
        console.error('新しいタブでの開封に失敗しました:', error);
        return null;
    }
};

/**
 * 現在のタブでURLを開く
 */
export const openInCurrentTab = async (url: string): Promise<boolean> => {
    try {
        const currentTab = await getCurrentTab();
        if (!currentTab || !currentTab.id) {
            return false;
        }

        await chrome.tabs.update(currentTab.id, { url });
        return true;
    } catch (error) {
        console.error('現在のタブでURLを開くのに失敗しました:', error);
        return false;
    }
};

/**
 * 指定したタブに移動する
 */
export const focusTab = async (tabId: number): Promise<boolean> => {
    try {
        await chrome.tabs.update(tabId, { active: true });
        return true;
    } catch (error) {
        console.error('タブのフォーカスに失敗しました:', error);
        return false;
    }
};

/**
 * タブのタイトルを取得する
 */
export const getTabTitle = (tab: chrome.tabs.Tab | null): string => {
    return tab?.title || '';
};

/**
 * タブのURLを取得する
 */
export const getTabUrl = (tab: chrome.tabs.Tab | null): string => {
    return tab?.url || '';
};