from PIL import Image
from PIL import ImageDraw

from flask import abort
from flask import Flask
from flask import request
from flask import send_file
from flask import render_template


Image.MAX_IMAGE_PIXELS = None
map_small = Image.open("map-small.jpg")
map_medium = Image.open("map-medium.jpg")


def get_hurdat_shape(initials):
	initials = initials.upper()
	if initials in ["TD", "TS", "HU"]: return "circle"
	elif initials in ["SD", "SS"]: return "square"
	elif initials in["EX", "LO", "DB", "WV"]: return "triangle"


def get_atcf_shape(initials):
	initials = initials.upper()
	if initials in ["TY", "TD", "TS", "ST", "TC", "HU", "XX"]: return "circle"
	elif initials in ["SD", "SS"]: return "square"
	elif initials in ["EX", "MD", "IN", "DS", "LO", "WV", "ET", "DB"]: return "triangle"


def get_ibtracs_shape(initials):
	initials = initials.upper()
	if initials in ["TS", "NR", "MX"]: return "circle"
	elif initials == "SS": return "square"
	elif initials in ["ET", "DS"]: return "triangle"


def get_rsmc_shape(num):
	if num in ["2", "3", "4", "5", "7", "9"]: return "circle"
	elif num == "6": return "triangle"


def stage_to_shape(stage):
	if stage == "": return ""
	return {
		"extratropical cyclone": "triangle",
		"subtropical cyclone": "square",
		"tropical cyclone": "circle"
	}[stage.lower()]



def ibtracs_sshs_to_cat(num):
	if num in["-4", "-3", "-1"]: return -2
	elif num in ["-2", "0"]: return -1
	elif int(num) > 0 and int(num) < 6: return int(num)
	else: return -999


def speed_to_cat(speed):
	if speed == 0: return -999
	elif speed <= 34: return -2
	elif speed <= 64: return -1
	elif speed <= 83: return 1
	elif speed <= 96: return 2
	elif speed <= 113: return 3
	elif speed <= 137: return 4
	else: return 5



def cat_to_colour(cat):
	if cat == -999: return (192, 192, 192)
	elif cat == -2: return (94, 186, 255)
	elif cat == -1: return (0, 250, 244)
	elif cat == 1: return (255, 255, 204)
	elif cat == 2: return (255, 231, 117)
	elif cat == 3: return (255, 193, 64)
	elif cat == 4: return (255, 143, 32)
	else: return (255, 96, 96)



def make_map(tracks, size):
	if size == "medium": map, DOT_SIZE = map_medium, 30
	else: map, DOT_SIZE = map_small, 10

	FULL_WIDTH, FULL_HEIGHT = map.size


	for i in tracks:
		i["longitude"] = FULL_WIDTH/2 - float(i["longitude"][:-1]) * (-1 if i["longitude"][-1] == "E" else 1) / 360 * FULL_WIDTH
		i["latitude"] = FULL_HEIGHT/2 - float(i["latitude"][:-1]) * (-1 if i["latitude"][-1] == "S" else 1) / 180 * FULL_HEIGHT

	# cropping and resizing ==============================================

	ZOOM = 3

	min_longitude = min(i["longitude"] for i in tracks)
	max_longitude = max(i["longitude"] for i in tracks)
	min_latitude = min(i["latitude"] for i in tracks)
	max_latitude = max(i["latitude"] for i in tracks)

	top = min_latitude - FULL_HEIGHT * 5/180
	left = min_longitude - FULL_WIDTH * 5/360
	bottom = max_latitude + FULL_HEIGHT * 5/180
	right = max_longitude + FULL_WIDTH * 5/360

	if right - left < FULL_HEIGHT*45/180:
		padding = (FULL_HEIGHT*45/180 - (right-left)) / 2
		right += padding
		left -= padding
	
	if right - left < bottom - top:
		padding = ((bottom-top) - (right-left)) / 2
		right += padding
		left -= padding

	if bottom - top < (right-left) / 1.618033988749894:
		padding = ((right-left) / 1.618033988749894 - (bottom-top)) / 2
		bottom += padding
		top -= padding

	if left < 0: left = 0
	if top < 0: top = 0
	if right > FULL_WIDTH: right = FULL_WIDTH
	if bottom > FULL_HEIGHT: bottom = FULL_HEIGHT


	new_map = map.crop((left, top, right, bottom))
	new_map = new_map.resize((round(new_map.size[0] * ZOOM), round(new_map.size[1] * ZOOM)))


	# drawing =============================================================

	draw = ImageDraw.Draw(new_map)
	zoom_width, zoom_height = new_map.size

	sorted_tracks = {}
	for marker in tracks:
		marker["longitude"] = round((marker["longitude"] - left) * ZOOM)
		marker["latitude"] = round((marker["latitude"] - top) * ZOOM)
		if marker["name"] in sorted_tracks: sorted_tracks[marker["name"]].append(marker)
		else: sorted_tracks[marker["name"]] = [marker]

	for tracks in sorted_tracks.values():
		draw.line(
			[(marker["longitude"], marker["latitude"]) for marker in tracks],
			fill="white",
			width=round(DOT_SIZE/3)
		)

		current = ""
		for marker in tracks:
			if marker["shape"] != "" and current != marker["shape"]: current = marker["shape"]
			shape = marker["shape"]

			if shape == "triangle":
				triangle_coordinates = (
					marker["longitude"],
					marker["latitude"] - round(DOT_SIZE/2*ZOOM),
					marker["longitude"] - round(DOT_SIZE/2*ZOOM),
					marker["latitude"] + round(DOT_SIZE/2*ZOOM),
					marker["longitude"] + round(DOT_SIZE/2*ZOOM),
					marker["latitude"] + round(DOT_SIZE/2*ZOOM)
				)
				draw.polygon(triangle_coordinates, fill=cat_to_colour(marker["category"]))
				continue

			coordinates = (
				marker["longitude"] - round(DOT_SIZE/2*ZOOM),
				marker["latitude"] - round(DOT_SIZE/2*ZOOM),
				marker["longitude"] + round(DOT_SIZE/2*ZOOM),
				marker["latitude"] + round(DOT_SIZE/2*ZOOM)
			)
			if shape == "square": draw.rectangle(coordinates, fill=cat_to_colour(marker["category"]))
			elif shape == "circle": draw.ellipse(coordinates, fill=cat_to_colour(marker["category"]))

	return new_map.resize((round(zoom_width//1.25), round(zoom_height//1.25)), resample=Image.ANTIALIAS) # anti aliasing


app = Flask(__name__)

@app.route("/")
def main():
	return render_template("index.html")


@app.route("/api/trackgen", methods=["POST"])
def gen_tracker():
	tracks = request.json

	if tracks == None: abort(400)

	size = request.args.get("size", "small")

	for i in tracks:
		i["category"] = speed_to_cat(float(i["speed"]))
		i["shape"] = stage_to_shape(i["stage"])
		del i["speed"]
		del i["stage"]

	make_map(tracks, size).save("tempFile.png")
	return send_file("tempFile.png")


@app.route("/api/hurdat", methods=["POST"])
def hurdat():
	data = request.json.split("\n")

	parsed = []
	unique_id = ""
	for line in data:
		cols = line.split(", ")
		if len(cols) == 3:
			unique_id = cols[0]
		else:
			parsed.append(
				{
					"name": unique_id,
					"latitude": cols[4],
					"longitude": cols[5],
					"category": speed_to_cat(float(cols[6])),
					"shape": get_hurdat_shape(cols[3])
				}
			)
	
	make_map(parsed, "small").save("tempFile.png")
	return send_file("tempFile.png")


@app.route("/api/atcf",  methods=["POST"])
def atcf():	
	data = request.json.split("\n")

	parsed = []
	for line in data:
		cols = line.split(", ")
		parsed.append(
			{
				"name": cols[1],
				"latitude": cols[6][:-2]+"."+cols[6][-2:],
				"longitude": cols[7][:-2]+"."+cols[7][-2:],
				"category": speed_to_cat(float(cols[8])),
				"shape": get_atcf_shape(cols[10])
			}
		)
	
	make_map(parsed, "small").save("tempFile.png")
	return send_file("tempFile.png")


@app.route("/api/ibtracs", methods=["POST"])
def ibtracs():
	data = request.json.split("\n")[2:]

	parsed = []
	for line in data:
		if line != "":
			cols = line.split(",")
			parsed.append(
				{
					"name": cols[0],
					"latitude": cols[8]+"N",
					"longitude": cols[9]+"E",
					"category": ibtracs_sshs_to_cat(cols[25]),
					"shape": get_ibtracs_shape(cols[7])
				}
			)

	make_map(parsed, "small").save("tempFile.png")
	return send_file("tempFile.png")


@app.route("/api/rsmc", methods=["POST"])
def rsmc():	
	data = request.json.split("\n")


	unique_id = []
	parsed = []
	for line in data:
		cols = line.split(" ")
		cleaned_cols = []
		for col in cols:
			if col != "": cleaned_cols.append(col)
		cols = cleaned_cols
		if len(cols) == 9:
			unique_id = cols[1]
		else:
			parsed.append(
				{
					"name": unique_id,
					"latitude": cols[3][:-1]+"."+cols[3][-1:]+"N",
					"longitude": cols[4][:-1]+"."+cols[4][-1:]+"E",
					"category": speed_to_cat(float(cols[6])),
					"shape": get_rsmc_shape(cols[2])
				}
			)

	make_map(parsed, "small").save("tempFile.png")
	return send_file("tempFile.png")



@app.route("/favicon.ico")
def favicon():
	return send_file("static/media/favicon.ico")


app.run("0.0.0.0")