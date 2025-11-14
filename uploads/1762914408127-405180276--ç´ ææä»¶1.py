import os
import shutil

def move_files_up(source_directory, top_directory):
    # 遍历目录中的所有项
    for item in os.listdir(source_directory):
        item_path = os.path.join(source_directory, item)
        # 如果项是文件，移动到顶级目录
        if os.path.isfile(item_path):
            destination_path = os.path.join(top_directory, item)
            # 如果目标位置已存在文件，生成新的名字
            counter = 1
            original_destination = destination_path
            while os.path.exists(destination_path):
                file_name, file_extension = os.path.splitext(original_destination)
                destination_path = f"{file_name}_{counter}{file_extension}"
                counter += 1
            shutil.move(item_path, destination_path)
        # 如果项是目录，递归调用自己
        elif os.path.isdir(item_path):
            move_files_up(item_path, top_directory)
            # 删除空目录
            if not os.listdir(item_path):
                os.rmdir(item_path)

# 替换这个路径为你的顶级目录路径
top_directory = "/Users/yuniancong/Downloads/Album"
move_files_up(top_directory, top_directory)

print("完成移动和清理工作。")