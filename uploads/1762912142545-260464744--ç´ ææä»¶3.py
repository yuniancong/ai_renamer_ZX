import tkinter as tk
from tkinter import ttk

def create_interface():
    root = tk.Tk()
    root.title("Skills with AMA")

    # Frame for the sidebar
    sidebar_frame = ttk.Frame(root, padding="10")
    sidebar_frame.grid(row=0, column=0, sticky="ns")

    # Sidebar content
    logo_label = tk.Label(sidebar_frame, text="Improve skills with", font=("Arial", 18))
    logo_label.pack(pady=10)

    login_button = ttk.Button(sidebar_frame, text="Sign up with Google")
    login_button.pack(pady=10)

    already_label = tk.Label(sidebar_frame, text="Already have an account? Login")
    already_label.pack(pady=10)

    # Frame for the main content
    main_frame = ttk.Frame(root, padding="10")
    main_frame.grid(row=0, column=1, sticky="nsew")

    # Mentors section
    mentors_frame = ttk.Frame(main_frame, padding="10")
    mentors_frame.grid(row=0, column=0, sticky="ew")
    mentors_label = tk.Label(mentors_frame, text="Mentors", font=("Arial", 14))
    mentors_label.pack(pady=5)

    mentor1_label = tk.Label(mentors_frame, text="Anton Jr.\nCreative director\n2 new courses", borderwidth=2, relief="groove")
    mentor1_label.pack(pady=5)

    mentor2_label = tk.Label(mentors_frame, text="Moyo Shiro\nUX Designer\nNow streaming", borderwidth=2, relief="groove")
    mentor2_label.pack(pady=5)

    # Timelines section
    timelines_frame = ttk.Frame(main_frame, padding="10")
    timelines_frame.grid(row=1, column=0, sticky="ew")
    timelines_label = tk.Label(timelines_frame, text="Timelines", font=("Arial", 14))
    timelines_label.pack(pady=5)

    timeline1_label = tk.Label(timelines_frame, text="Ultimate UI Design\n8:30 am - 10:30 am\n3D MasterClass\n7:00 am - 9:30 am", borderwidth=2, relief="groove")
    timeline1_label.pack(pady=5)

    timeline2_label = tk.Label(timelines_frame, text="Design thinking in 3 steps\n16:00 pm - 18:00 pm", borderwidth=2, relief="groove")
    timeline2_label.pack(pady=5)

    # Profile section
    profile_frame = ttk.Frame(main_frame, padding="10")
    profile_frame.grid(row=0, column=1, rowspan=2, sticky="ns")
    profile_label = tk.Label(profile_frame, text="Anton Jr.", font=("Arial", 14))
    profile_label.pack(pady=5)

    profile_details = tk.Label(profile_frame, text="Creative director at @ui8.net\nA designer that keens simplicity and usability")
    profile_details.pack(pady=5)

    book_class_button = ttk.Button(profile_frame, text="Book class $1300")
    book_class_button.pack(pady=10)

    follow_button = ttk.Button(profile_frame, text="Follow")
    follow_button.pack(pady=10)

    stats_label = tk.Label(profile_frame, text="Students: 35,789\nContent: 3,648\nFollowers: 3.6m")
    stats_label.pack(pady=10)

    course_label = tk.Label(profile_frame, text="Become a UX Designer\nLearn the skills & get the Job\nRating: 4.85+ (48h)", borderwidth=2, relief="groove")
    course_label.pack(pady=5)

    root.mainloop()

if __name__ == "__main__":
    create_interface()