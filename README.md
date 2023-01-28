## [TrackGen](https://trackgen.codingcactus.repl.co/) - The simplest tropical cyclone track map generator

### Usage
- Each line is a point to be plotted on the map
- Each field gives information about the point to be plotted

| Field      | Description | Example | Required? |
|:----------:|:------------|:-------:|:---------:|
| Name       | Name of the cyclone, used to join points together | Iota | <ul><li> [ ] </li></ul> |
| Latitude   | Latitude coordinate, choose either °N or °S instead of using negative numbers | 52 °N | <ul><li> [x] </li></ul> |
| Longitude  | Longitude coordinate, choose either °E or °W instead of using negative numbers | 1°W | <ul><li> [x] </li></ul> |
| Wind Speed | Wind speed at that point, leave blank for unknown speeds | 25 kt | <ul><li> [ ] </li></ul> |
| Stage      | Stage of tropical cyclone (determines shape used for point) | Tropical Cyclone | <ul><li> [x] </li></ul> |
