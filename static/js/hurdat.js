function getHurdatShape(initials) {
    const i = initials.toUpperCase();

    if (["TD", "TS", "HU", "TY"].includes(i)) {
        return "circle";
    } else if (["SD", "SS"].includes(i)) {
        return "square";
    } else if (["EX", "LO", "DB", "WV"].includes(i)) {
        return "triangle";
    }
}

function parseHurdat(data) {
    const lines = data.split("\n");

    const parsed = [];
    let uniqueId = "";
    lines.forEach(line => {
       const cols = line.split(", ");

       if (cols.length === 3) {
           uniqueId = cols[0];
       } else {
           parsed.push(
               {
                   name:      uniqueId,
                   shape:     getHurdatShape(cols[3]),
                   category:  speedToCat(Number(cols[6])),
                   latitude:  cols[4],
                   longitude: cols[5]
               }
           )
       }
    });

    return parsed
}
