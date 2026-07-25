import json
import re
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style="ticks")

# -------------------------
# Load JSON
# -------------------------
with open("register_of_actions.json", "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data["register_of_actions"])

# -------------------------
# Clean Data
# -------------------------
df["date"] = pd.to_datetime(df["date"])

df = df.sort_values("date")

# Length of each docket entry
df["length"] = df["action"].str.len()

# Word count
df["words"] = df["action"].str.split().str.len()

# Year / Month
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month_name()

# Sequential event number
df["event"] = range(1, len(df)+1)

# -------------------------
# Auto Categorizer
# -------------------------

patterns = {
    "Motion": r"\bMotion\b",
    "Hearing": r"\bHearing\b",
    "Order": r"\bOrder\b",
    "Minute Order": r"Minute Order",
    "Declaration": r"Declaration",
    "Settlement": r"Settlement",
    "Dismissal": r"Dismissal",
    "Discovery": r"Discovery|Interrogatories|Admissions|Deposition",
    "Trial": r"Trial",
    "Counsel": r"Counsel",
    "Proof of Service": r"Proof of Service",
    "Notice": r"Notice",
}

def classify(text):
    for k,v in patterns.items():
        if re.search(v,text,re.I):
            return k
    return "Other"

df["category"] = df["action"].apply(classify)

# -------------------------
# lmplot (Anscombe replacement)
# -------------------------

sns.lmplot(
    data=df,
    x="event",
    y="length",
    col="category",
    hue="category",
    col_wrap=3,
    ci=None,
    height=4,
    scatter_kws={"s":60}
)

plt.show()