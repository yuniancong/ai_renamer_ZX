import tkinter as tk
from tkinter import ttk

class CurrencyConverter:
    def __init__(self, root):
        self.root = root
        self.root.title("Currency Converter")

        self.amount_var = tk.StringVar()
        self.from_currency_var = tk.StringVar(value="USD")
        self.to_currency_var = tk.StringVar(value="EUR")
        self.result_var = tk.StringVar()

        self.create_widgets()

    def create_widgets(self):
        tk.Label(self.root, text="Amount:").grid(row=0, column=0, padx=10, pady=10)
        tk.Entry(self.root, textvariable=self.amount_var).grid(row=0, column=1, padx=10, pady=10)

        tk.Label(self.root, text="From:").grid(row=1, column=0, padx=10, pady=10)
        ttk.Combobox(self.root, textvariable=self.from_currency_var, values=["USD", "EUR", "CAD"]).grid(row=1, column=1, padx=10, pady=10)

        tk.Label(self.root, text="To:").grid(row=2, column=0, padx=10, pady=10)
        ttk.Combobox(self.root, textvariable=self.to_currency_var, values=["USD", "EUR", "CAD"]).grid(row=2, column=1, padx=10, pady=10)

        tk.Button(self.root, text="Convert", command=self.convert).grid(row=3, column=0, columnspan=2, pady=10)
        
        tk.Label(self.root, text="Result:").grid(row=4, column=0, padx=10, pady=10)
        tk.Entry(self.root, textvariable=self.result_var, state='readonly').grid(row=4, column=1, padx=10, pady=10)

    def convert(self):
        try:
            amount = float(self.amount_var.get())
        except ValueError:
            self.result_var.set("Invalid amount")
            return

        from_currency = self.from_currency_var.get()
        to_currency = self.to_currency_var.get()

        conversion_rates = {
            "USD": {"USD": 1, "EUR": 0.85, "CAD": 1.25},
            "EUR": {"USD": 1.18, "EUR": 1, "CAD": 1.47},
            "CAD": {"USD": 0.80, "EUR": 0.68, "CAD": 1}
        }

        if from_currency in conversion_rates and to_currency in conversion_rates[from_currency]:
            converted_amount = amount * conversion_rates[from_currency][to_currency]
            self.result_var.set(f"{converted_amount:.2f} {to_currency}")
        else:
            self.result_var.set("Conversion not available")

if __name__ == "__main__":
    root = tk.Tk()
    app = CurrencyConverter(root)
    root.mainloop()