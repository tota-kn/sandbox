import re
import shutil


def read_file_text(path: str):
    text: str = ""
    with open(input_file_path, 'r') as f:
        text = f.read() 
    return text 


input_file_path = "/Users/yt/Dropbox/obsidian/publish/memo/ios AppStore用証明書の作成.md"
input_images_directory = "/Users/yt/Dropbox/obsidian/attachments/"
output_file_path = "./result/result.md"
output_images_directory = "./result/"

input_file_text = read_file_text(input_file_path)

pattern = r"!\[\[(.*\.(png|jpg|jpeg|gif))\]\]"
rpattern = re.compile(pattern)
result = rpattern.sub(r"![](/images/\1)", input_file_text)

with open(output_file_path,"w") as f:
    f.write(result)


lists = re.findall(r"!\[\[(.*\.(png|jpg|jpeg|gif))\]\]", input_file_text)
for l in lists:
    shutil.copy(input_images_directory + l[0], output_images_directory)



def write_text_file(path: str, text: str):
    with open(path,"w") as f:
        f.write(text)
