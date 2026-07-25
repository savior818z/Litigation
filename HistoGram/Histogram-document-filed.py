import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style="ticks")

# Load JSON
with open("documents_filed.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Create DataFrame
df = pd.DataFrame(data["documents_filed"])

# Convert dates
df["date"] = pd.to_datetime(df["date"])

# Plot
f, ax = plt.subplots(figsize=(14, 6))
sns.despine(f)

sns.histplot(
    data=df,
    x="date",
    hue="filed_by",
    multiple="stack",
    bins=30,
    edgecolor=".3",
    linewidth=.5,
)

ax.set_title("Documents Filed Over Time")
ax.set_xlabel("Date Filed")
ax.set_ylabel("Number of Documents")

plt.tight_layout()
plt.show()