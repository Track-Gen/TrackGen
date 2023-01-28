function getRsmcShape(num) {
    if (["2", "3", "4", "5", "7", "9"].includes(num)) {
        return "circle";
    } else if (num === "6") {
        return "triangle";
    }
}

function parseRsmc(data) {
    const lines = data.split("\n");

    const parsed = [];
    let uniqueId = "";

    lines.forEach(line => {
        const cols = line.split(" ").filter(l => l !== "");

        if (cols.length === 9) {
            uniqueId = cols[1];
        } else {
            parsed.push(
                {
                    name:      uniqueId,
                    shape:     getRsmcShape(cols[2]),
                    category:  speedToCat(Number(cols[6])),
                    latitude:  cols[3].slice(0, -1) + "." + cols[3].slice(-1) + "N",
                    longitude: cols[4].slice(0, -1) + "." + cols[4].slice(-1) + "E"
                }
            )
        }
    });

    return parsed;
}
