function getIbtracsShape(initials) {
    const i = initials.toUpperCase();

    if (["TS", "NR", "MX"].includes(i)) {
        return "circle";
    } else if (["SS"].includes(i)) {
        return "square";
    } else if (["ET", "DS"].includes(i)) {
        return "triangle";
    }
}

function parseIbtracs(data) {
    const lines = data.split("\n").slice(2);

    const parsed = [];
    lines.forEach(line => {
        if (line !== "") {
            const cols = line.split(",");

            const wmo_wind = Number(cols[10]);
            const usa_wind = Number(cols[23]);

            parsed.push(
                {
                    name:      cols[0],
                    shape:     getIbtracsShape(cols[7]),
                    category:  speedToCat(Math.max(wmo_wind, usa_wind)),
                    latitude:  cols[8] + "N",
                    longitude: cols[9] + "E"
                }
            );
        }
    });

    return parsed;
}
