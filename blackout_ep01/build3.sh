#!/bin/bash
set -euo pipefail
A=/workspace/blackout_ep01/assets
B=/workspace/blackout_ep01/build
OUT=/workspace/blackout_ep01/EP01_熄灯之后_电影版.mp4
FPS=30
SANS=$(fc-match -f '%{file}' 'Noto Sans CJK SC')
SERIF=$(fc-match -f '%{file}' 'Noto Serif CJK SC')
rm -rf "$B"; mkdir -p "$B"

seg() {
  ffmpeg -y -loglevel error -i "$1" \
    -vf "crop=698:1242:11:0,scale=1080:1920:flags=lanczos,setsar=1,fps=${FPS},eq=contrast=1.07:saturation=0.94:gamma=0.98,vignette=PI/4.6,noise=alls=3:allf=t,format=yuv420p" \
    -t "$2" -an -c:v libx264 -preset veryfast -crf 19 "$3"
}

# ---------- 画面 ----------
ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=3" \
  -vf "drawtext=fontfile=${SERIF}:text='熄灯之后':fontcolor=white:fontsize=118:x=(w-text_w)/2:y=(h/2)-220:alpha='if(lt(t,0.8),t/0.8,if(gt(t,2.2),(3-t)/0.8,1))',drawtext=fontfile=${SANS}:text='EP01   别开门':fontcolor=0xD8D8D8:fontsize=46:x=(w-text_w)/2:y=(h/2)+10:alpha='if(lt(t,1.0),0,if(gt(t,2.2),(3-t)/0.8,1))'" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p "$B/00.mp4"

seg "$A/mv01.mp4"                   5 "$B/01.mp4"
seg "$A/mv02.mp4"                   5 "$B/02.mp4"
seg "$A/mv07.mp4"                   5 "$B/03.mp4"
seg "$A/mv04.mp4"                   5 "$B/04.mp4"
seg "$A/mv05.mp4"                   4 "$B/05.mp4"
seg "$A/mv06.mp4"                   5 "$B/06.mp4"
seg "$A/mv08.mp4"                   5 "$B/07.mp4"
seg "$A/shot09_pounding_motion.mp4" 5 "$B/08.mp4"
seg "$A/mv10.mp4"                   5 "$B/09.mp4"
seg "$A/shot11_door_ajar_motion.mp4" 6 "$B/10.mp4"
seg "$A/mv12.mp4"                   5 "$B/11.mp4"

ffmpeg -y -loglevel error -f lavfi -i "color=c=black:s=1080x1920:r=${FPS}:d=4" \
  -vf "drawtext=fontfile=${SANS}:text='EP02   门外的声音':fontcolor=0xD8D8D8:fontsize=54:x=(w-text_w)/2:y=(h/2)-70:alpha='if(lt(t,0.6),t/0.6,if(gt(t,3.0),(4-t)/1.0,1))',drawtext=fontfile=${SANS}:text='穿校服的人在外面，':fontcolor=0x8A8A8A:fontsize=34:x=(w-text_w)/2:y=(h/2)+40:alpha='if(lt(t,1.2),0,if(gt(t,3.0),(4-t)/1.0,1))',drawtext=fontfile=${SANS}:text='那电话是谁打来的？':fontcolor=0x8A8A8A:fontsize=34:x=(w-text_w)/2:y=(h/2)+100:alpha='if(lt(t,1.6),0,if(gt(t,3.0),(4-t)/1.0,1))'" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p "$B/99.mp4"

ls "$B"/[0-9][0-9].mp4 | sort | sed "s|^|file '|;s|$|'|" > "$B/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$B/list.txt" -c copy "$B/silent.mp4"

# ---------- 音效合成 ----------
# 环境底噪：雨
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:duration=62:sample_rate=44100" \
  -af "highpass=f=550,lowpass=f=9000,volume=0.075" "$B/sfx_rain.wav"
# 地鸣 / 待机低频
ffmpeg -y -loglevel error -f lavfi -i "sine=f=42:duration=62:sample_rate=44100" \
  -af "volume=0.17" "$B/sfx_rumble.wav"
# 心跳（从 9 秒开始）
ffmpeg -y -loglevel error -f lavfi -i "sine=f=57:duration=53:sample_rate=44100" \
  -af "tremolo=f=1.15:d=0.95,volume=0.13,adelay=9000|9000" "$B/sfx_heart.wav"
# 雷（第 5 秒）
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=brown:duration=4:sample_rate=44100" \
  -af "lowpass=f=210,afade=t=in:st=0:d=0.04,afade=t=out:st=0.7:d=3.2,volume=1.1,aecho=0.8:0.55:130:0.5" "$B/sfx_thunder.wav"
# 撞门（3 下）
ffmpeg -y -loglevel error -f lavfi -i "sine=f=67:duration=0.5:sample_rate=44100" \
  -af "lowpass=f=190,afade=t=in:st=0:d=0.008,afade=t=out:st=0.05:d=0.42,volume=1.0" "$B/sfx_knock.wav"
# 门把手金属碰撞
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=white:duration=0.09:sample_rate=44100" \
  -af "highpass=f=2600,afade=t=out:st=0.004:d=0.085,volume=0.55,aecho=0.6:0.3:45:0.35" "$B/sfx_click.wav"
# 走廊脚步（湿冷水泥）
ffmpeg -y -loglevel error -f lavfi -i "sine=f=92:duration=0.16:sample_rate=44100" \
  -af "lowpass=f=240,afade=t=out:st=0.01:d=0.14,volume=0.75" "$B/sfx_step.wav"
# 手机震动
ffmpeg -y -loglevel error -f lavfi -i "sine=f=142:duration=0.34:sample_rate=44100" \
  -af "acrusher=bits=3:mix=1,tremolo=f=26:d=1,volume=0.30" "$B/sfx_buzz.wav"
# 门轴吱呀
ffmpeg -y -loglevel error -f lavfi -i "sine=f=430:duration=1.7:sample_rate=44100" \
  -af "vibrato=f=6.5:d=0.7,volume=0.20,afade=t=in:st=0:d=0.5,afade=t=out:st=1.1:d=0.6,aecho=0.7:0.4:90:0.4" "$B/sfx_creak.wav"
# 渐强紧张音
ffmpeg -y -loglevel error -f lavfi -i "aevalsrc='0.22*sin(2*PI*(70+38*t)*t)':d=5:s=44100" \
  -af "afade=t=in:st=0:d=3.5,afade=t=out:st=4.6:d=0.4" "$B/sfx_riser.wav"
# 呼吸（压抑）
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:duration=9:sample_rate=44100" \
  -af "bandpass=f=850:w=700,tremolo=f=1.9:d=0.85,volume=0.045" "$B/sfx_breath.wav"

# ---------- 混音 ----------
ffmpeg -y -loglevel error -i "$B/silent.mp4" \
  -i "$B/sfx_rain.wav" -i "$B/sfx_rumble.wav" -i "$B/sfx_heart.wav" \
  -i "$B/sfx_thunder.wav" -i "$B/sfx_knock.wav" -i "$B/sfx_click.wav" \
  -i "$B/sfx_step.wav" -i "$B/sfx_buzz.wav" -i "$B/sfx_creak.wav" \
  -i "$B/sfx_riser.wav" -i "$B/sfx_breath.wav" \
  -filter_complex "\
[1:a]volume=1[r];[2:a]volume=1[m];[3:a]volume=1[h];\
[4:a]adelay=5000|5000,volume=1[t1];\
[5:a]adelay=37200|37200[v1];[5:a]adelay=38000|38000[v2];[5:a]adelay=38900|38900[v3];\
[5:a]adelay=47400|47400[v4];\
[6:a]adelay=24700|24700[c1];\
[7:a]adelay=19500|19500[s1];[7:a]adelay=20400|20400[s2];[7:a]adelay=21300|21300[s3];\
[8:a]adelay=32300|32300[b1];[8:a]adelay=33000|33000[b2];[8:a]adelay=33700|33700[b3];[8:a]adelay=34400|34400[b4];\
[9:a]adelay=47600|47600[k1];\
[10:a]adelay=42000|42000[g1];\
[11:a]adelay=42300|42300[p1];\
[r][m][h][t1][v1][v2][v3][v4][c1][s1][s2][s3][b1][b2][b3][b4][k1][g1][p1]\
amix=inputs=19:normalize=0,alimiter=limit=0.92,afade=t=in:st=0:d=1.2,afade=t=out:st=58:d=4[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$B/mixed.mp4"

# ---------- 烧字幕 ----------
ffmpeg -y -loglevel error -i "$B/mixed.mp4" \
  -vf "subtitles=/workspace/blackout_ep01/ep01.srt:force_style='FontName=Noto Sans CJK SC,FontSize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2.4,Shadow=0.8,Alignment=2,MarginV=230,Spacing=0.6'" \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy "$OUT"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
