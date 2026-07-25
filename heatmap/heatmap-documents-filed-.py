with open("documents_filed.json", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data["documents_filed"])

df["date"] = pd.to_datetime(df["date"])

features = pd.DataFrame({
    "Year": df["date"].dt.year,
    "Month": df["date"].dt.month,
    "Day": df["date"].dt.day,
    "Document Length": df["document"].str.len(),
    "Filed By Length": df["filed_by"].str.len(),
    "Motion": df["document"].str.contains("Motion",case=False).astype(int),
    "Minute Order": df["document"].str.contains("Minute Order",case=False).astype(int),
    "Opposition": df["document"].str.contains("Opposition",case=False).astype(int),
    "Declaration": df["document"].str.contains("Declaration",case=False).astype(int),
    "Plaintiff": df["filed_by"].str.contains("Plaintiff",case=False).astype(int),
    "Defendant": df["filed_by"].str.contains("Defendant",case=False).astype(int),
    "Clerk": df["filed_by"].str.contains("Clerk",case=False).astype(int),
})

corr = features.corr()

mask = np.triu(np.ones_like(corr, dtype=bool))
f, ax = plt.subplots(figsize=(11,9))
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

plt.title("Documents Filed Correlation")
plt.show()