/**
 * タイトル文字列からタグを抽出する
 * @param title タイトル文字列
 * @returns 抽出されたタグの配列（@マーク付き）
 */
export const extractTags = (title: string): string[] => {
  if (!title) {
    return [];
  }

  const tagRegex = /@(\S+)/g;
  const matches = title.match(tagRegex);

  return matches ? matches : [];
};

/**
 * テキストから@プレフィックスを削除する
 * @param text 処理対象のテキスト
 * @returns @プレフィックスが削除されたテキスト
 */
export const removeTagPrefix = (text: string): string => {
  return text.startsWith('@') ? text.substring(1) : text;
};

/**
 * テキストに@プレフィックスを追加する（既に@がある場合は追加しない）
 * @param text 処理対象のテキスト
 * @returns @プレフィックスが追加されたテキスト
 */
export const addTagPrefix = (text: string): string => {
  return text.startsWith('@') ? text : `@${text}`;
};

/**
 * 同じタグが重複しないようにタグをマージする
 * @param existingTags 既存のタグ配列
 * @param newTags 新規のタグ配列
 * @returns マージされたユニークなタグの配列
 */
export const mergeTags = (existingTags: string[], newTags: string[]): string[] => {
  const uniqueTags = new Set([...existingTags, ...newTags]);
  return Array.from(uniqueTags);
};

/**
 * タグを文字列に変換する（スペース区切り）
 * @param tags タグの配列
 * @returns スペース区切りでタグを結合した文字列
 */
export const tagsToString = (tags: string[]): string => {
  return tags.join(' ');
};

/**
 * タイトルから特定のタグを削除する
 * @param title タイトル文字列
 * @param tagToRemove 削除するタグ
 * @returns タグが削除されたタイトル
 */
export const removeTagFromTitle = (title: string, tagToRemove: string): string => {
  return title.replace(tagToRemove, '').replace(/\s+/g, ' ').trim();
};