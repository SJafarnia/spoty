import os
import sys
import requests
import filetype
from mutagen.id3  import TIT2, TPE1, APIC
from mutagen.mp3 import MP3
from moviepy.editor import AudioFileClip

def convert_audio_mp4_to_mp3_with_tags(input_file, output_file, metadata):
    """Converts an audio-only MP4 file to an MP3 file with ID3 tags using moviepy and mutagen.

    Args:
        input_file: The path to the MP4 input file.
        output_file: The desired path for the MP3 output file.
        metadata: A dictionary of ID3 tags to add, e.g., {'artist': 'Artist Name', 'album': 'Album Name', 'title': 'Song Title'}
    """

    # Check mimetypes
    kind = filetype.guess(input_file)

    if kind.mime == "video/mp4" or kind.mime == "video/webm" :
        audio = AudioFileClip(input_file)
        audio.write_audiofile(output_file)  # Save as MP3

        # Add ID3 tags using mutagen
        audio_file = MP3(output_file)
        audio_file["TIT2"] = TIT2(encoding=3, text=u''+metadata["title"]+'')
        audio_file["TPE1"] = TPE1(encoding=3, text=u''+metadata["artist"]+'')

        #Downlaod the album cover    
        response =  requests.get(metadata["cover"])
        response.raise_for_status()  # Raise an exception for HTTP errors
        image_data = response.content 
                
        audio_file["APIC"] = APIC(
            encoding=3,  # 3 for UTF-8 encoding
            mime="image/jpeg",  # Assuming the image is JPEG
            type=3,  # 3 for front cover art
            desc="Album Cover",
            data=image_data,
        )

        audio_file.save()

        # Delete the MP4 file
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"Deleted MP4 file: {input_file}")


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    artist = sys.argv[1]
    title = sys.argv[2]
    cover =sys.argv[3]
    metadata = {'artist': artist, 'title': title, 'cover':cover}

    convert_audio_mp4_to_mp3_with_tags(f'{artist} - {title}.mp4', f'{artist} - {title}.mp3', metadata)
