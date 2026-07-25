import json
import pandas as pd
import seaborn as sns
import matplotlib as mpl
import matplotlib.pyplot as plt

sns.set_theme(style="ticks")

# Read your JSON
with open("proceedings_held.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Convert JSON to DataFrame
df = pd.DataFrame(data["proceedings_held"])

# Plot
f, ax = plt.subplots(figsize=(10, 6))
sns.despine(f)

sns.histplot(
    data=df,
    x="department",          # replaces diamonds "price"
    hue="status",            # replaces diamonds "cut"
    multiple="stack",
    palette="Set2",
    edgecolor=".3",
    linewidth=.5,
    shrink=.9,
)

ax.set_xlabel("Department")
ax.set_ylabel("Proceedings")
ax.set_title("Proceedings Held by Department")

plt.xticks(rotation=45)
plt.tight_layout()
plt.show()