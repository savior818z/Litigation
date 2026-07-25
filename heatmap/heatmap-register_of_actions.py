import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

sns.set_theme(style="white")

with open("register_of_actions.json", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data["register_of_actions"])

df["date"] = pd.to_datetime(df["date"])

# Numerical features
features = pd.DataFrame({
    "Year": df["date"].dt.year,
    "Month": df["date"].dt.month,
    "Day": df["date"].dt.day,
    "Action Length": df["action"].str.len(),
    "Words": df["action"].str.split().str.len(),
    "Contains Hearing": df["action"].str.contains("Hearing", case=False).astype(int),
    "Contains Motion": df["action"].str.contains("Motion", case=False).astype(int),
    "Contains Filed": df["action"].str.contains("Filed", case=False).astype(int),
    "Contains Vacated": df["action"].str.contains("Vacated", case=False).astype(int),
    "Contains Settlement": df["action"].str.contains("Settlement", case=False).astype(int),
})

corr = features.corr()

mask = np.triu(np.ones_like(corr, dtype=bool))
f, ax = plt.subplots(figsize=(10,8))
cmap = sns.diverging_palette(230,20,as_cmap=True)

sns.heatmap(
    corr,
    mask=mask,
    cmap=cmap,
    annot=True,
    square=True,
    linewidths=.5,
    cbar_kws={"shrink":.5}
)

plt.title("Register of Actions Correlation")
plt.show()