/**
 * タイトルからタグを抽出する関数（@タグ形式）
 */
export const extractTags = (title: string): string[] => {
    const tagRegex = /(?:^|\s)(@[^\s]+)/g;
    const matches = [...title.matchAll(tagRegex)];
    return matches.map(match => match[1]);
};

/**
 * タグからプレフィックス(@)を削除する
 */
export const removeTagPrefix = (tag: string): string => {
    return tag.startsWith('@') ? tag.substring(1) : tag;
};

/**
 * タグにプレフィックス(@)を追加する
 */
export const addTagPrefix = (tag: string): string => {
    return tag.startsWith('@') ? tag : `@${tag}`;
};

/**
 * タイトルからタグを削除する
 */
export const removeTagFromTitle = (title: string, tagToRemove: string): string => {
    return title.replace(tagToRemove, '').replace(/\s+/g, ' ').trim();
};

/**
 * タイトルにタグを追加する
 */
export const addTagToTitle = (title: string, tag: string): string => {
    const formattedTag = addTagPrefix(tag);
    return `${title} ${formattedTag}`.trim();
};

/**
 * タイトルからすべてのタグを除去した表示用タイトルを作成
 */
export const createDisplayTitle = (title: string): string => {
    return title.replace(/\s?@[^\s]+\s?/g, ' ').trim();
};