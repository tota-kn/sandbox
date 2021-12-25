from xml.etree import ElementTree

# MacOSの場合
xml_path = "/Users/yt/Library/Containers/com.amazon.Kindle/Data/Library/Application Support/Kindle/Cache/KindleSyncMetadataCache.xml"
root = ElementTree.parse(xml_path)
titles = [title.text for title in root.iter("title")]
for title in sorted(titles):
    print(title)
