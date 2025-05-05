# services/metadata_service.py

from PIL import Image, ExifTags
from typing import Dict, Any, Union
from io import BytesIO
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def _convert_to_degrees(value):
    """Convert GPS coordinates to degrees."""
    try:
        d = float(value[0][0]) / float(value[0][1])
        m = float(value[1][0]) / float(value[1][1])
        s = float(value[2][0]) / float(value[2][1])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception as e:
        logging.warning(f"Failed to convert GPS to degrees: {e}")
        return None

def _clean_value(value):
    """Clean up binary or unreadable metadata."""
    if isinstance(value, bytes):
        if value == b'\x00' * len(value) or all(b == 0x00 or b < 0x20 or b > 0x7e for b in value):
            return None
        try:
            return value.decode('utf-8', errors='ignore').strip()
        except Exception:
            return str(value)
    return value

def extract_exif_data(image_path: Union[str, BytesIO]) -> Dict[str, Any]:
    try:
        if isinstance(image_path, str):
            image = Image.open(image_path)
        else:
            image = Image.open(BytesIO(image_path.read()))

        exif_data = image._getexif()
        if not exif_data:
            logging.warning("No EXIF metadata found.")
            return {"error": "No EXIF metadata found."}

        metadata = {}
        gps_info = {}

        print("\n📸 Extracted EXIF tags:")

        for tag_id, value in exif_data.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            cleaned_value = _clean_value(value)
            if cleaned_value is None:
                continue

            if tag == "GPSInfo":
                print(f"\n🔍 GPSInfo:")
                for gps_tag_id in value:
                    gps_tag = ExifTags.GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_value = _clean_value(value[gps_tag_id])
                    if gps_value:
                        gps_info[gps_tag] = gps_value
                        print(f"  - {gps_tag}: {gps_value}")

                # Convert lat/lon if available
                if "GPSLatitude" in gps_info and "GPSLatitudeRef" in gps_info:
                    lat = _convert_to_degrees(gps_info["GPSLatitude"])
                    if gps_info["GPSLatitudeRef"] != "N":
                        lat = -lat
                    gps_info["Latitude"] = round(lat, 6)
                    print(f"  - Latitude: {gps_info['Latitude']}")

                if "GPSLongitude" in gps_info and "GPSLongitudeRef" in gps_info:
                    lon = _convert_to_degrees(gps_info["GPSLongitude"])
                    if gps_info["GPSLongitudeRef"] != "E":
                        lon = -lon
                    gps_info["Longitude"] = round(lon, 6)
                    print(f"  - Longitude: {gps_info['Longitude']}")

                metadata["GPSInfo"] = gps_info
            else:
                metadata[tag] = cleaned_value
                print(f"🗂️ {tag}: {cleaned_value}")

        return metadata

    except Exception as e:
        logging.error(f"Error extracting EXIF metadata: {e}")
        return {"error": f"Error extracting EXIF metadata: {e}"}
