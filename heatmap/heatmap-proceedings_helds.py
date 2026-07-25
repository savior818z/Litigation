with open("proceedings_held.json", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data["proceedings_held"])

df["date_time"] = pd.to_datetime(df["date_time"])

features = pd.DataFrame({
    "Year": df["date_time"].dt.year,
    "Month": df["date_time"].dt.month,
    "Hour": df["date_time"].dt.hour,
    "Department": pd.factorize(df["department"])[0],
    "Proceeding Length": df["proceeding"].str.len(),
    "Status Length": df["status"].str.len(),
    "Held": df["status"].str.contains("Held").astype(int),
    "Vacated": df["status"].str.contains("Vacated").astype(int),
    "Continued": df["status"].str.contains("Continued").astype(int),
    "Granted": df["status"].str.contains("Granted").astype(int),
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

plt.title("Proceedings Held Correlation")
plt.show()