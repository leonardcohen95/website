#!/usr/bin/env bash
set -euo pipefail

A=/workspace/blackout_ep01/assets
B=/workspace/blackout_ep01/build
mkdir -p "$B"
FPS=30
SERIF=/usr/share/fonts/opentype/noto-cjk-otf/NotoSerifCJKsc-Bold.otf
SANS=/usr/share/fonts/opentype/noto-cjk-otf/NotoSansCJKsc-Regular.otf

still() { # src dur mode out
  local src=$1 dur=$2 mode=$3 out=$4
  local n=$((dur*FPS))
  local z
  if [ "$mode" = "in" ]; then z="min(1.0+0.0012*on,1.12)"; else z="max(1.12-0.0012*on,1.0)"; fi
  # 先裁掉底部 2.8%（去掉生成器水印），并按 9:16 居中裁边
  ffmpeg -y -loglevel error -loop 1 -i "$src" \
    -vf "crop=1399:2488:20:0,scale=1440:2560:flags=lanczos,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=1080x1920:fps=${FPS},vignette=PI/5,noise=alls=4:allf=t,format=yuv420p" \
    -frames:v "$n" -r $FPS -c:v libx264 -preset veryfast -crf 20 "$out"
}

vseg() { # src dur out
  ffmpeg -y -loglevel error -i "$1" \
    -vf "crop=698:1242:11:0,scale=1080:1920:flags=lanczos,setsar=1,fps=${FPS},vignette=PI/5,noise=alls=4:allf=t,format=yuv420p" \
    -t "$2" -an -c:v libx264 -preset veryfast -crf 20 "$3"
}

# 00 片头字卡
ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=3" \
  -vf "drawtext=fontfile=${SERIF}:text='熄灯之后':fontcolor=white:fontsize=118:x=(w-text_w)/2:y=(h/2)-220:alpha='if(lt(t,0.8),t/0.8,if(gt(t,2.2),(3-t)/0.8,1))',drawtext=fontfile=${SANS}:text='EP01  别开门':fontcolor=0xD8D8D8:fontsize=46:x=(w-text_w)/2:y=(h/2)+10:alpha='if(lt(t,1.0),0,if(gt(t,2.2),(3-t)/0.8,1))',drawtext=fontfile=${SANS}:text='凌晨 3 点 17 分  六号女生宿舍楼':fontcolor=0x8A8A8A:fontsize=28:x=(w-text_w)/2:y=(h/2)+140:alpha='if(lt(t,1.2),0,if(gt(t,2.2),(3-t)/0.8,1))'" \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$B/00_title.mp4"

still "$A/shot01_exterior.jpg"      5 in  "$B/01.mp4"
still "$A/shot02_wake.jpg"          6 in  "$B/02.mp4"
still "$A/scene_dorm_hallway.jpg"   4 in  "$B/03.mp4"
still "$A/shot04_scream.jpg"        6 in  "$B/04.mp4"
still "$A/shot05_handle.jpg"        7 in  "$B/05.mp4"
vseg  "$A/shot_demo_wall_back.mp4"  8     "$B/06.mp4"
still "$A/shot06_peephole.jpg"      6 in  "$B/07.mp4"
still "$A/shot07_empty_bed.jpg"     8 out "$B/08.mp4"
still "$A/shot08_phone_call.jpg"    7 in  "$B/09.mp4"
vseg  "$A/shot09_pounding_motion.mp4" 5   "$B/10.mp4"
still "$A/shot10_mop.jpg"           7 in  "$B/11.mp4"
vseg  "$A/shot11_door_ajar_motion.mp4" 6  "$B/12.mp4"
still "$A/shot12_window_hand.jpg"  10 in  "$B/13.mp4"

# 99 片尾钩子
ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=4" \
  -vf "drawtext=fontfile=${SANS}:text='EP02   门外的声音':fontcolor=0xD8D8D8:fontsize=54:x=(w-text_w)/2:y=(h/2)-40:alpha='if(lt(t,0.6),t/0.6,if(gt(t,3.0),(4-t)/1.0,1))',drawtext=fontfile=${SANS}:text='那通电话，是谁打来的？':fontcolor=0x8A8A8A:fontsize=32:x=(w-text_w)/2:y=(h/2)+80:alpha='if(lt(t,1.2),0,if(gt(t,3.0),(4-t)/1.0,1))'" \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$B/99_end.mp4"

rm -f "$B/episode_silent.mp4"
ls "$B"/[0-9][0-9]*.mp4 | sort | sed "s|^|file '|;s|$|'|" > "$B/list.txt"

ffmpeg -y -loglevel error -f concat -safe 0 -i "$B/list.txt" -c copy "$B/episode_silent.mp4"

# 环境声：雨 + 低频嗡鸣
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.10:duration=92:seed=42" \
  -f lavfi -i "sine=frequency=52:duration=92" \
  -filter_complex "[0:a]highpass=f=180,lowpass=f=2200,volume=1.8[rain];[1:a]volume=0.28,tremolo=f=0.12:d=0.8[drone];[rain][drone]amix=inputs=2:normalize=0,afade=t=in:st=0:d=2.5,afade=t=out:st=87:d=5[a]" \
  -map "[a]" -c:a aac -b:a 128k "$B/bed.m4a"

ffmpeg -y -loglevel error -i "$B/episode_silent.mp4" -i "$B/bed.m4a" \
  -map 0:v -map 1:a -c:v copy -c:a copy -shortest \
  /workspace/blackout_ep01/EP01_熄灯之后.mp4

ffprobe -v error -show_entries format=duration,size -of default=nw=1 /workspace/blackout_ep01/EP01_熄灯之后.mp4
