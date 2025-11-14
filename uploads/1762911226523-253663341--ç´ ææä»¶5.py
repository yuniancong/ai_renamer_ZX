import tkinter as tk
from tkinter import ttk
from datetime import datetime

def format_date():
    input_date_str = date_entry.get()
    try:
        input_date = datetime.strptime(input_date_str, "%Y年%m月%d日")
        formatted_date = input_date.strftime("%Y-%m-%d")
        formatted_date_label.config(text=formatted_date)
        
        day_of_week = input_date.strftime("%A")
        day_of_week_label.config(text=f"{input_date_str} 是 {day_of_week}")

        day_of_year = input_date.timetuple().tm_yday
        progress_label.config(text=f"今年已过 {day_of_year} 天")

    except ValueError:
        formatted_date_label.config(text="日期格式错误，请使用 YYYY年MM月DD日 格式")
        day_of_week_label.config(text="")
        progress_label.config(text="")

app = tk.Tk()
app.title("日期格式化和进度计算")

# 输入日期
date_entry_label = tk.Label(app, text="输入时间，时间格式为 2024年5月19日")
date_entry_label.pack()
date_entry = tk.Entry(app)
date_entry.pack()

# 格式化后的日期
formatted_date_label = tk.Label(app, text="输出对应格式的时间标签代码，形式如 2024-05-19")
formatted_date_label.pack()

# 判断星期几
day_of_week_label = tk.Label(app, text="根据输入的时间，判定当天是周几")
day_of_week_label.pack()

# 年进度
progress_label = tk.Label(app, text="并且注明当年的时间进度")
progress_label.pack()

# 按钮
format_button = tk.Button(app, text="格式化日期", command=format_date)
format_button.pack()

app.mainloop()