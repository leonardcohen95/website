#!/bin/bash
set -euo pipefail
A=/workspace/blackout_ep01/assets
B=/workspace/blackout_ep01/build
OUT=/workspace/blackout_ep01/EP01_熄灯之后_电影版.mp4
FPS=30
SANS=$(fc-match -f '%{file}' 'Noto Sans CJK SC' || true)
SERIF=$(fc-match -f '%{file}' 'Noto Serif CJK SC' || true)
rm -rf "$B"; mkdir -p "$B"

seg() { # src dur out
  ffmpeg -y -loglevel error -i "$1" \
    -vf "crop=698:1242:11:0,scale=1080:1920:flags=lanczos,setsar=1,fps=${FPS},eq=contrast=1.07:saturation=0.94:gamma=0.98,vignette=PI/4.6,noise=alls=3:allf=t,format=yuv420p" \
    -t "$2" -an -c:v libx264 -preset veryfast -crf 19 "$3"
}

ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=3" \
  -vf "drawtext=fontfile=${SERIF}:text='熄灯之后':fontcolor=white:fontsize=118:x=(w-text_w)/2:y=(h/2)-220:alpha='if(lt(t,0.8),t/0.8,if(gt(t,2.2),(3-t)/0.8,1))',drawtext=fontfile=${SANS}:text='EP01  别开门':fontcolor=0xD8D8D8:fontsize=46:x=(w-text_w)/2:y=(h/2)+10:alpha='if(lt(t,1.0),0,if(gt(t,2.2),(3-t)/0.8,1))',drawtext=fontfile=${SANS}:text='凌晨 3 点 17 分  六号女生宿舍楼':fontcolor=0x8A8A8A:fontsize=28:x=(w-text_w)/2:y=(h/2)+140:alpha='if(lt(t,1.2),0,if(gt(t,2.2),(3-t)/0.8,1))'" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p "$B/00.mp4"

seg "$A/mv01.mp4"                  5 "$B/01.mp4"
seg "$A/mv02.mp4"                  5 "$B/02.mp4"
seg "$A/mv04.mp4"                  5 "$B/03.mp4"
seg "$A/mv05.mp4"                  4 "$B/04.mp4"
seg "$A/mv06.mp4"                  5 "$B/05.mp4"
seg "$A/mv07.mp4"                  5 "$B/06.mp4"
seg "$A/mv08.mp4"                  5 "$B/07.mp4"
seg "$A/shot09_pounding_motion.mp4" 5 "$B/08.mp4"
seg "$A/mv10.mp4"                  5 "$B/09.mp4"
seg "$A/shot11_door_ajar_motion.mp4" 6 "$B/10.mp4"
seg "$A/mv12.mp4"                  5 "$B/11.mp4"

ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=4" \
  -vf "drawtext=fontfile=${SANS}:text='EP02   门外的声音':fontcolor=0xD8D8D8:fontsize=54:x=(w-text_w)/2:y=(h/2)-40:alpha='if(lt(t,0.6),t/0.6,if(gt(t,3.0),(4-t)/1.0,1))',drawtext=fontfile=${SANS}:text='那通电话，是谁打来的？':fontcolor=0x8A8A8A:fontsize=32:x=(w-text_w)/2:y=(h/2)+80:alpha='if(lt(t,1.2),0,if(gt(t,3.0),(4-t)/1.0,1))'" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p "$B/99.mp4"

ls "$B"/[0-9][0-9].mp4 | sort | sed "s|^|file '|;s|$|'|" > "$B/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$B/list.txt" -c copy "$B/silent.mp4"

# 音效：雨 + 地鸣 + 心跳 + 三次撞门 + 门轴
ffmpeg -y -loglevel error -f lavfi -i "sine=f=68:d=0.45:sample_rate=44100" \
  -af "lowpass=f=180,afade=t=in:st=0:d=0.01,afade=t=out:st=0.06:d=0.39,volume=1" "$B/thud.wav"

ffmpeg -y -loglevel error -i "$B/silent.mp4" \
  -f lavfi -i "anoisesrc=color=pink:duration=62:sample_rate=44100" \
  -f lavfi -i "sine=f=45:duration=62:sample_rate=44100" \
  -f lavfi -i "sine=f=54:duration=62:sample_rate=44100" \
  -itsoffset 37.2 -i "$B/thud.wav" \
  -itsoffset 38.0 -i "$B/thud.wav" \
  -itsoffset 38.9 -i "$B/thud.wav" \
  -itsoffset 47.4 -i "$B/thud.wav" \
  -filter_complex "\
[1:a]highpass=f=500,lowpass=f=7500,volume=0.085[rain];\
[2:a]volume=0.20[rum];\
[3:a]tremolo=f=1.25:d=0.9,volume=0.15[hb];\
[4:a]volume=0.85[t1];[5:a]volume=0.85[t2];[6:a]volume=0.7[t3];[7:a]volume=0.45[t4];\
[rain][rum][hb][t1][t2][t3][t4]amix=inputs=7:normalize=0,\
afade=t=in:st=0:d=1.5,afade=t=out:st=57:d=5[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
