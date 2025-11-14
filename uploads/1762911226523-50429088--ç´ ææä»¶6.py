import tkinter as tk
from tkinter import messagebox
import math

class TrianglePropertiesCalculator:
    def __init__(self, master):
        self.master = master
        master.title("三角形性质判断器")

        self.canvas = tk.Canvas(master, width=400, height=400, bg="white")
        self.canvas.pack()

        self.points = []
        self.lines = []

        self.canvas.bind("<Button-1>", self.add_point)

        self.calculate_button = tk.Button(master, text="计算", command=self.calculate_triangle_properties)
        self.calculate_button.pack()

    def add_point(self, event):
        x = self.snap_to_grid(event.x)
        y = self.snap_to_grid(event.y)
        self.points.append((x, y))
        
        point_label = chr(ord('A') + len(self.points) - 1) # A, B, C...
        self.canvas.create_text(x, y - 10, text=point_label, font=("Arial", 12, "bold"))

        if len(self.points) >= 2:
            # Draw line between last two points
            x1, y1 = self.points[-2]
            x2, y2 = self.points[-1]
            line = self.canvas.create_line(x1, y1, x2, y2)
            self.lines.append(line)

        if len(self.points) == 3:
            self.canvas.unbind("<Button-1>")
    
    def snap_to_grid(self, value, grid_size=20):
        return int(round(value / grid_size) * grid_size)

    def calculate_triangle_properties(self):
        if len(self.points) != 3:
            messagebox.showerror("错误", "请标注三个顶点")
            return

        x1, y1 = self.points[0]
        x2, y2 = self.points[1]
        x3, y3 = self.points[2]

        side_a = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        side_b = math.sqrt((x3 - x2)**2 + (y3 - y2)**2)
        side_c = math.sqrt((x1 - x3)**2 + (y1 - y3)**2)

        angle_A = math.degrees(math.acos((side_b**2 + side_c**2 - side_a**2) / (2 * side_b * side_c)))
        angle_B = math.degrees(math.acos((side_a**2 + side_c**2 - side_b**2) / (2 * side_a * side_c)))
        angle_C = 180 - angle_A - angle_B

        if side_a == side_b == side_c:
            triangle_type = "等边三角形"
        elif side_a == side_b or side_a == side_c or side_b == side_c:
            triangle_type = "等腰三角形"
        else:
            triangle_type = "普通三角形"

        messagebox.showinfo("三角形性质", f"边长：\nAB={side_a:.2f}，BC={side_b:.2f}，CA={side_c:.2f}\n\n"
                                        f"角度：\nA={angle_A:.2f}°，B={angle_B:.2f}°，C={angle_C:.2f}°\n\n"
                                        f"类型：{triangle_type}")

root = tk.Tk()
app = TrianglePropertiesCalculator(root)
root.mainloop()