import os
import shutil

def move_contents_up(directory):
    # 遍历目录中的所有项
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        # 检查这个项是否是一个目录
        if os.path.isdir(item_path):
            # 遍历子目录中的所有项
            for sub_item in os.listdir(item_path):
                sub_item_path = os.path.join(item_path, sub_item)
                destination_path = os.path.join(directory, sub_item)
                # 如果目标位置已存在文件/文件夹（重名），生成新的名字
                counter = 1
                original_destination = destination_path
                while os.path.exists(destination_path):
                    # 生成新的文件/文件夹名字，避免覆盖
                    destination_path = f"{original_destination}_{counter}"
                    counter += 1
                # 移动子目录的内容到父目录
                shutil.move(sub_item_path, destination_path)
            # 删除现在空的子目录
            os.rmdir(item_path)

# 替换这个路径为你的顶级目录路径
top_directory = "/Users/yuniancong/Downloads/主题临时"
move_contents_up(top_directory)

print("完成移动和清理工作。")
