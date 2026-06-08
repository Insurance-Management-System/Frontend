export function Avatar({name, size=36, primary = false}) {

    const initials = (name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0,2)
        .toUpperCase()

    return(
        <div className={`ag-avatar ${primary ? "ag-avatar-primary" : ""}`}
        style={{ width: size, height: size, fontSize: size * 0.38 }}>
            {initials}
        </div>
    )

}